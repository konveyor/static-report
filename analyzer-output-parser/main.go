package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/konveyor/analyzer-lsp/output/v1/konveyor"
	"github.com/konveyor/analyzer-lsp/provider"
	"go.lsp.dev/uri"
	"gopkg.in/yaml.v2"
)

type Application struct {
	Id         string
	Name       string
	SourcePath string
	Rulesets   []konveyor.RuleSet
	DepItems   []konveyor.DepsFlatItem
	Files      map[string]string

	analysisPath         string
	depsPath             string
	providerSettingsPath string
}

var (
	analysisOutputPaths   = flag.String("analysis-output-list", "", "comma separated list of output files for multiple analyses")
	depsOutputPaths       = flag.String("deps-output-list", "", "comma separated list of depedency output files for multiple dep analyses")
	providerSettingsPaths = flag.String("provider-settings-list", "", "comma separated list of provider settings files used for multiple analyses")
)

var applications []*Application

func main() {
	flag.Parse()

	err := validateFlags()
	if err != nil {
		log.Fatal("failed to validate flags", err)
	}

	err = loadApplications()
	if err != nil {
		log.Fatal("failed to load provider settings", err)
	}

	err = generateJSBundle(applications)
	if err != nil {
		log.Fatal("failed to generate output.js file from template", err)
	}
}

func validateFlags() error {
	if analysisOutputPaths == nil || *analysisOutputPaths == "" {
		return fmt.Errorf("analysis-output is required")
	}
	if providerSettingsPaths == nil || *providerSettingsPaths == "" {
		return fmt.Errorf("provider-settings is required")
	}
	if depsOutputPaths == nil || *depsOutputPaths == "" {
		log.Println("dependency output path not provided, only parsing analysis output")
	}

	analysisPaths := strings.Split(*analysisOutputPaths, ",")
	depPaths := strings.Split(*depsOutputPaths, ",")
	settingsPaths := strings.Split(*providerSettingsPaths, ",")

	if len(settingsPaths) != len(analysisPaths) {
		return fmt.Errorf("exactly as much analysis output paths must be specified as there are provider settings")
	}

	for idx, settingsPath := range settingsPaths {
		currApp := &Application{
			Id:                   fmt.Sprintf("%04d", idx),
			Rulesets:             make([]konveyor.RuleSet, 0),
			DepItems:             make([]konveyor.DepsFlatItem, 0),
			Files:                make(map[string]string),
			providerSettingsPath: settingsPath,
		}
		if len(analysisPaths) >= idx {
			currApp.analysisPath = analysisPaths[idx]
		}
		if len(depPaths) >= idx {
			currApp.depsPath = depPaths[idx]
		}
		applications = append(applications, currApp)
	}

	return nil
}

// loadApplications loads applications from provider config
func loadApplications() error {
	for _, app := range applications {
		content, err := os.ReadFile(app.providerSettingsPath)
		if err != nil {
			return err
		}

		configs := []provider.Config{}
		err = yaml.Unmarshal(content, &configs)
		if err != nil {
			return err
		}

		sourcePaths := map[string]interface{}{}
		for _, config := range configs {
			for _, initConfig := range config.InitConfig {
				if _, found := sourcePaths[initConfig.Location]; !found {
					sourcePaths[initConfig.Location] = nil
				}
			}
		}

		for path := range sourcePaths {
			app.SourcePath = path
			app.Name = filepath.Base(path)
		}

		loadOutputs(app)
	}
	return nil
}

func loadOutputs(app *Application) error {
	analysisReport, err := os.ReadFile(app.analysisPath)
	if err != nil {
		return err
	}

	err = yaml.Unmarshal(analysisReport, &app.Rulesets)
	if err != nil {
		return err
	}

	if app.depsPath != "" {
		depsReport, err := os.ReadFile(app.depsPath)
		if err != nil {
			return err
		}

		err = yaml.Unmarshal(depsReport, &app.DepItems)
		if err != nil {
			return err
		}
	}

	for _, rs := range app.Rulesets {
		for key, violation := range rs.Violations {
			violation.Extras = []byte("null")
			rs.Violations[key] = violation
			for _, inc := range violation.Incidents {
				if _, err := uri.Parse(string(inc.URI)); err == nil {
					content, err := os.ReadFile(inc.URI.Filename())
					if err != nil {
						continue
					}
					app.Files[string(inc.URI)] = string(content)
				}
			}
		}
	}

	return nil
}

func generateJSBundle(apps []*Application) error {
	output, err := json.Marshal(apps)
	if err != nil {
		log.Fatal("failed to marshal applications", err)
	}

	tmpl := template.Must(template.New("").Parse(`
window["apps"] = {{.Apps}}
`))
	file, err := os.Create("output.js")
	if err != nil {
		log.Fatal("failed to create output.js file", err)
	}
	defer file.Close()
	err = tmpl.Execute(file, struct {
		Apps string
	}{
		Apps: string(output),
	})
	return err
}
