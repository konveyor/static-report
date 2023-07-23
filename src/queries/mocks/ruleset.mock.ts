import { RulesetDto, ISSUE_CATEGORIES, AppDto } from "@app/api/ruleset";

export let MOCK_APPS: AppDto[];

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
                    uri: "file://test-files/file1.java",
                    message: "Test message",
                    lineNumber: 12,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 12,
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
                    lineNumber: 12,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 12,
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
                    lineNumber: 12,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 12,
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
                    lineNumber: 12,
                    codeSnip: "",
                    variables: {},
                },
                {
                    uri: "file://test-files/file2.java",
                    message: "Test message",
                    lineNumber: 12,
                    codeSnip: "",
                    variables: {},
                },
            ],
        },
    },
  }

  const app1: AppDto = {
    id: "01",
    name: "app-01",
    location: "./app-01/",
    rulesets: [rs1, rs2],
  }

  const app2: AppDto = {
    id: "02",
    name: "app-02",
    location: "./app-02",
    rulesets: [rs1, rs2],
  }

  MOCK_APPS = [app1, app2]
}