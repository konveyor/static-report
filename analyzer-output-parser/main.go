package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"text/template"

	"github.com/konveyor/analyzer-lsp/output/v1/konveyor"
	"go.lsp.dev/uri"
	"gopkg.in/yaml.v2"
)

type Application struct {
	Id       string                  `yaml:"id" json:"id"`
	Name     string                  `yaml:"name" json:"name"`
	Rulesets []konveyor.RuleSet      `yaml:"rulesets" json:"rulesets"`
	DepItems []konveyor.DepsFlatItem `yaml:"depItems" json:"depItems"`
	Files    map[string]string       `yaml:"files" json:"files"`

	analysisPath string `yaml:"-" json:"-"`
	depsPath     string `yaml:"-" json:"-"`
}

var (
	analysisOutputPaths = flag.String("analysis-output-list", "", "comma separated list of output files for multiple analyses")
	depsOutputPaths     = flag.String("deps-output-list", "", "comma separated list of depedency output files for multiple dep analyses")
	outputPath          = flag.String("output-path", "output.js", "full path to output file to generate")
	names               = flag.String("application-name-list", "", "comma separated list of names to display in the report")
)

var applications []*Application

func main() {
	flag.Parse()

	err := validateFlags()
	if err != nil {
		log.Fatalln("failed to validate flags", err)
	}

	err = loadApplications()
	if err != nil {
		log.Fatalln("failed to load provider settings", err)
	}

	err = generateJSBundle(applications)
	if err != nil {
		log.Fatalln("failed to generate output.js file from template", err)
	}
}

func validateFlags() error {
	if analysisOutputPaths == nil || *analysisOutputPaths == "" {
		return fmt.Errorf("analysis-output-list is required")
	}
	if names == nil || *names == "" {
		return fmt.Errorf("application-name-list is required")
	}
	if depsOutputPaths == nil || *depsOutputPaths == "" {
		log.Println("dependency output path not provided, only parsing analysis output")
	}
	analysisPaths := strings.Split(*analysisOutputPaths, ",")
	depPaths := strings.Split(*depsOutputPaths, ",")
	appNames := strings.Split(*names, ",")
	for idx, analysisPath := range analysisPaths {
		currApp := &Application{
			Id:           fmt.Sprintf("%04d", idx),
			Rulesets:     make([]konveyor.RuleSet, 0),
			DepItems:     make([]konveyor.DepsFlatItem, 0),
			Files:        make(map[string]string),
			analysisPath: strings.Trim(analysisPath, " "),
		}
		if len(depPaths) > idx {
			currApp.depsPath = depPaths[idx]
		}
		if len(appNames) >= idx {
			currApp.Name = strings.Trim(appNames[idx], " ")
		}
		applications = append(applications, currApp)
	}

	return nil
}

// loadApplications loads applications from provider config
func loadApplications() error {
	for _, app := range applications {
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
							log.Println("failed reading file")
							continue
						}
						app.Files[string(inc.URI)] = string(content)
					}
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
	file, err := os.Create(*outputPath)
	if err != nil {
		log.Fatal("failed to create JS output bundle", err)
	}
	defer file.Close()
	err = tmpl.Execute(file, struct {
		Apps string
	}{
		Apps: string(output),
	})
	return err
}
