import { RulesetDto, ISSUE_CATEGORIES, ApplicationDto, DependencyDto, DependencyItemDto, FileDto } from "@app/api/report";

export let MOCK_APPS: ApplicationDto[];

export let MOCK_RULESETS: RulesetDto[];

export let MOCK_FILES: FileDto;

if (
    process.env.NODE_ENV === "test" ||
    process.env.REACT_APP_DATA_SOURCE === "mock"
  ) {
  const rs1: RulesetDto = {
    description: "Test Ruleset 1",
    name: "test-rs-001",
    tags: [
        "tag1",
        "tag2",
        "Category1=tag3,tag4"
    ],
    violations: {
        "rule-001": {
            description: "Test Rule 001\nTest description",
            category: ISSUE_CATEGORIES[0],
            labels: [
                "konveyor.io/source=src-1",
                "konveyor.io/target=tgt-1",
            ],
            links: [
                {
                    title: "Test Link 1",
                    url: "https://konveyor.io",
                },
            ],
            effort: 1,
            incidents: [
                {
                    uri: "konveyor-jdt://contents/home/pranav/.m2/repository/io/konveyor/demo/config-utils/1.0.0/config-utils-1.0.0.jar?packageName=io.konveyor.demo.config.ApplicationConfiguration.class\u0026source-range=true",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
            ],
        },
        "rule-002": {
            description: "Test Rule 002\nTest description",
            category: ISSUE_CATEGORIES[1],
            labels: [
                "konveyor.io/target=tgt-1",
                "konveyor.io/target=tgt-2",
                "test-label1",
            ],
            links: [
                {
                    title: "Test Link 1",
                    url: "https://konveyor.io",
                },
            ],
            effort: 1,
            incidents: [
                {
                    uri: "file://test-files/file1.java",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
            ],
        },
    },
  }

  const rs2: RulesetDto = {
    description: "Test Ruleset 2",
    name: "test-rs-002",
    tags: [
        "tag5",
        "tag6",
        "Category2=tag3,tag4"
    ],
    violations: {
        "rule-001": {
            description: "Test Rule 001\nTest description",
            category: ISSUE_CATEGORIES[0],
            labels: [
                "konveyor.io/source=src-1",
                "konveyor.io/target=tgt-1",
            ],
            links: [
                {
                    title: "Test Link 1",
                    url: "https://konveyor.io",
                },
            ],
            effort: 1,
            incidents: [
                {
                    uri: "file://test-files/file1.java",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
            ],
        },
        "rule-002": {
            description: "Test Rule 002\nTest description",
            category: ISSUE_CATEGORIES[1],
            labels: [
                "konveyor.io/target=tgt-1",
                "konveyor.io/target=tgt-2",
                "test-label1",
            ],
            links: [
                {
                    title: "Test Link 1",
                    url: "https://konveyor.io",
                },
            ],
            effort: 3,
            incidents: [
                {
                    uri: "file://test-files/file1.java",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 13,
                    codeSnip: "",
                    variables: {},
                },
            ],
        },
    },
  }

  const javaDeps: DependencyDto[] = [
    {
        name: "test-dep-00",
        fileURIPrefix: "file:///test-file",
        indirect: false,
        labels: [
            "konveyor.io/source=downloadable",
            "konveyor.io/language=java",
            "label",
        ],
        resolvedIdentifier: "1234",
        version: "v1.0.0",
    },
    {
        name: "test-dep-01",
        fileURIPrefix: "file:///test-file",
        indirect: false,
        labels: [
            "konveyor.io/source=open-source",
            "konveyor.io/language=java",
            "label",
        ],
        resolvedIdentifier: "1234",
        version: "v1.0.0",
    }
  ]

  const goDeps: DependencyDto[] = [
    {
        name: "test-dep-02",
        fileURIPrefix: "file:///test-file",
        indirect: false,
        labels: [
            "konveyor.io/language=go",
            "label",
        ],
        resolvedIdentifier: "1234",
        version: "v1.0.0",
    }
  ]

  const depItems: DependencyItemDto[] = [
    {
        fileURI: "pom.xml",
        provider: "java",
        dependencies: javaDeps,
    },
    {
        fileURI: "go.mod",
        provider: "java",
        dependencies: goDeps,
    }
  ]

  const files: FileDto = {
    "file://test-files/file1.java": `package com.example.apps;
import io.fabric8.kubernetes.api.model.apiextensions.v1beta1.CustomResourceDefinition;
        
public class App 
{
public static void main( String[] args )
{
    CustomResourceDefinition crd = new CustomResourceDefinition();
    System.out.println( crd );

    GenericClass<String> element = new GenericClass<String>("Hello world!");
    element.get();
}
}`,
    "file://test-files/file2.java": `package com.example.apps;
public class GenericClass<T> {
private T element;
        
public GenericClass(T element) {
    this.element = element;
}
            
public T get() {
    return element;
}
}`,
}

  const app1: ApplicationDto = {
    id: "01",
    name: "app-01",
    rulesets: [rs1, rs2],
    depItems: depItems,
    files,
  }

  const app2: ApplicationDto = {
    id: "02",
    name: "app-02",
    rulesets: [rs1, rs2],
    depItems: depItems,
    files,
  }

  MOCK_APPS = [app1, app2]
  MOCK_RULESETS = [rs1, rs2]
}