# Analyzer Output Parser

This is a go program that reads analyzer output and converts it into a compatible JS file for static report to work with. The program is used as one of the steps in the analyzer CLI to generate static report.

It can also be used standalone to generate static report for analyzer outputs you have locally. 

First build the project:

```sh
go build -o analyzer-output-parser main.go
```

Then run the binary to generate a static report bundle:

```sh
./analyzer-output-parser --analysis-output-list "<outputs-list>" --application-name-list "<application-names>" --deps-output-list "<dependencies-output-list>"
```

Since static report supports displaying outputs of multiple analyses, every option specified above takes a comma-separated list of paths. Note that the all lists should be in order.

For example:

```sh
./analyzer-output-parser --analysis-output-list "output1.yaml,output2.yaml" --deps-output-list "deps-output1.yaml,deps-output2.yaml" --application-name-list "app1,app2"
```

In the command above, files `output1.yaml` & `deps-output1.yaml` should correspond to the application `app1`. Similarly, for application `app2`.

