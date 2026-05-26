window["apps"] = [
  {
    "id": "1",
    "name": "example-java-app",
    "rulesets": [
      {
        "name": "eap8/eap7",
        "description": "Rules for migrating from JBoss EAP 7 to EAP 8",
        "tags": [
          "EAP",
          "JBoss",
          "Runtime=EAP 8"
        ],
        "violations": {
          "javaee-to-jakarta-namespaces-00001": {
            "description": "Replace javax.persistence with jakarta.persistence\nThe javax.persistence package has been moved to jakarta.persistence in Jakarta EE 9+. All imports must be updated.",
            "category": "mandatory",
            "effort": 1,
            "labels": [
              "konveyor.io/source=eap7",
              "konveyor.io/target=eap8",
              "konveyor.io/source=java-ee",
              "konveyor.io/target=jakarta-ee"
            ],
            "links": [
              {
                "title": "Jakarta Persistence Migration Guide",
                "url": "https://jakarta.ee/specifications/persistence/"
              }
            ],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/model/Customer.java",
                "message": "Replace `javax.persistence` with `jakarta.persistence`",
                "lineNumber": 3,
                "codeSnip": "1 package com.example.model;\n2 \n3 import javax.persistence.Entity;\n4 import javax.persistence.Table;\n5 import javax.persistence.Id;\n6 import javax.persistence.GeneratedValue;\n7 import javax.persistence.Column;\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/model/Customer.java",
                "message": "Replace `javax.persistence` with `jakarta.persistence`",
                "lineNumber": 4,
                "codeSnip": "1 package com.example.model;\n2 \n3 import javax.persistence.Entity;\n4 import javax.persistence.Table;\n5 import javax.persistence.Id;\n6 import javax.persistence.GeneratedValue;\n7 import javax.persistence.Column;\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/model/Customer.java",
                "message": "Replace `javax.persistence` with `jakarta.persistence`",
                "lineNumber": 5,
                "codeSnip": "1 package com.example.model;\n2 \n3 import javax.persistence.Entity;\n4 import javax.persistence.Table;\n5 import javax.persistence.Id;\n6 import javax.persistence.GeneratedValue;\n7 import javax.persistence.Column;\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/model/Order.java",
                "message": "Replace `javax.persistence` with `jakarta.persistence`",
                "lineNumber": 3,
                "codeSnip": "1 package com.example.model;\n2 \n3 import javax.persistence.Entity;\n4 import javax.persistence.Table;\n5 import javax.persistence.Id;\n6 import javax.persistence.ManyToOne;\n7 import javax.persistence.JoinColumn;\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/model/Order.java",
                "message": "Replace `javax.persistence` with `jakarta.persistence`",
                "lineNumber": 6,
                "codeSnip": "1 package com.example.model;\n2 \n3 import javax.persistence.Entity;\n4 import javax.persistence.Table;\n5 import javax.persistence.Id;\n6 import javax.persistence.ManyToOne;\n7 import javax.persistence.JoinColumn;\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/repository/CustomerRepository.java",
                "message": "Replace `javax.persistence` with `jakarta.persistence`",
                "lineNumber": 3,
                "codeSnip": "1 package com.example.repository;\n2 \n3 import javax.persistence.EntityManager;\n4 import javax.persistence.PersistenceContext;\n5 import javax.persistence.TypedQuery;\n",
                "variables": {}
              }
            ]
          },
          "javaee-to-jakarta-namespaces-00006": {
            "description": "Replace javax.inject with jakarta.inject\nThe javax.inject package has been replaced by jakarta.inject in Jakarta EE 9+.",
            "category": "mandatory",
            "effort": 1,
            "labels": [
              "konveyor.io/source=eap7",
              "konveyor.io/target=eap8",
              "konveyor.io/source=java-ee",
              "konveyor.io/target=jakarta-ee"
            ],
            "links": [
              {
                "title": "Jakarta Inject Specification",
                "url": "https://jakarta.ee/specifications/inject/"
              }
            ],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/service/CustomerService.java",
                "message": "Replace `javax.inject.Inject` with `jakarta.inject.Inject`",
                "lineNumber": 3,
                "codeSnip": "1 package com.example.service;\n2 \n3 import javax.inject.Inject;\n4 import javax.enterprise.context.ApplicationScoped;\n5 \n6 @ApplicationScoped\n7 public class CustomerService {\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/rest/CustomerResource.java",
                "message": "Replace `javax.inject.Inject` with `jakarta.inject.Inject`",
                "lineNumber": 5,
                "codeSnip": "3 \n4 import javax.ws.rs.*;\n5 import javax.inject.Inject;\n6 import javax.ws.rs.core.MediaType;\n7 import javax.ws.rs.core.Response;\n",
                "variables": {}
              }
            ]
          },
          "javaee-to-jakarta-namespaces-00030": {
            "description": "Replace javax.ws.rs with jakarta.ws.rs\nThe JAX-RS API has moved from javax.ws.rs to jakarta.ws.rs.",
            "category": "mandatory",
            "effort": 1,
            "labels": [
              "konveyor.io/source=eap7",
              "konveyor.io/target=eap8"
            ],
            "links": [
              {
                "title": "Jakarta RESTful Web Services",
                "url": "https://jakarta.ee/specifications/restful-ws/"
              }
            ],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/rest/CustomerResource.java",
                "message": "Replace `javax.ws.rs` with `jakarta.ws.rs`",
                "lineNumber": 4,
                "codeSnip": "1 package com.example.rest;\n2 \n3 import java.util.List;\n4 import javax.ws.rs.*;\n5 import javax.inject.Inject;\n6 import javax.ws.rs.core.MediaType;\n7 import javax.ws.rs.core.Response;\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/rest/CustomerResource.java",
                "message": "Replace `javax.ws.rs.core` with `jakarta.ws.rs.core`",
                "lineNumber": 6,
                "codeSnip": "4 import javax.ws.rs.*;\n5 import javax.inject.Inject;\n6 import javax.ws.rs.core.MediaType;\n7 import javax.ws.rs.core.Response;\n8 \n9 @Path(\"/customers\")\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/rest/OrderResource.java",
                "message": "Replace `javax.ws.rs` with `jakarta.ws.rs`",
                "lineNumber": 3,
                "codeSnip": "1 package com.example.rest;\n2 \n3 import javax.ws.rs.*;\n4 import javax.ws.rs.core.MediaType;\n5 import javax.ws.rs.core.Response;\n6 import javax.inject.Inject;\n",
                "variables": {}
              }
            ]
          }
        },
        "insights": {
          "javaee-to-jakarta-namespaces-info-00001": {
            "description": "Jakarta EE namespace migration detected\nThis application uses javax.* namespaces which were migrated to jakarta.* in Jakarta EE 9. Consider using automated tools to perform the migration.",
            "category": "potential",
            "labels": [
              "konveyor.io/source=eap7",
              "konveyor.io/target=eap8"
            ],
            "links": [
              {
                "title": "Jakarta EE Migration Guide",
                "url": "https://jakarta.ee/resources/jakarta-ee-developer-resources/"
              }
            ],
            "incidents": [
              {
                "uri": "file:///pom.xml",
                "message": "Application uses Java EE APIs that need to be migrated to Jakarta EE",
                "lineNumber": 1,
                "codeSnip": "1 <project>\n2   <modelVersion>4.0.0</modelVersion>\n3   <groupId>com.example</groupId>\n4   <artifactId>customer-service</artifactId>\n",
                "variables": {}
              }
            ]
          }
        }
      },
      {
        "name": "cloud-readiness",
        "description": "Rules for assessing cloud readiness of applications",
        "tags": [
          "Cloud",
          "Containerization",
          "Category=Cloud Readiness"
        ],
        "violations": {
          "local-storage-00001": {
            "description": "File system usage detected\nThe application writes to the local file system. Cloud-native applications should use external storage services instead of the local filesystem, as containers may be ephemeral.",
            "category": "mandatory",
            "effort": 5,
            "labels": [
              "konveyor.io/target=cloud-readiness"
            ],
            "links": [
              {
                "title": "Twelve-Factor App: Backing Services",
                "url": "https://12factor.net/backing-services"
              }
            ],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/service/FileExportService.java",
                "message": "Usage of local file system detected. Consider using object storage (e.g., S3) for cloud deployments.",
                "lineNumber": 15,
                "codeSnip": "13 \n14     public void exportReport(String data) {\n15         File outputFile = new File(\"/tmp/reports/\" + UUID.randomUUID() + \".csv\");\n16         try (FileWriter writer = new FileWriter(outputFile)) {\n17             writer.write(data);\n18         } catch (IOException e) {\n19             log.error(\"Failed to write report\", e);\n20         }\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/service/FileExportService.java",
                "message": "Usage of local file system detected for log file storage.",
                "lineNumber": 24,
                "codeSnip": "22 \n23     public void archiveLogs() {\n24         Path logsDir = Paths.get(\"/var/log/app/\");\n25         try (Stream<Path> paths = Files.walk(logsDir)) {\n26             paths.filter(Files::isRegularFile)\n27                  .forEach(this::compressFile);\n28         }\n",
                "variables": {}
              }
            ]
          },
          "hardcoded-ip-address-00001": {
            "description": "Hardcoded IP address found\nHardcoded IP addresses make applications non-portable across environments. Use DNS names or configuration properties instead.",
            "category": "mandatory",
            "effort": 3,
            "labels": [
              "konveyor.io/target=cloud-readiness"
            ],
            "links": [
              {
                "title": "Externalized Configuration",
                "url": "https://12factor.net/config"
              }
            ],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/config/AppConfig.java",
                "message": "Hardcoded IP address `192.168.1.100` found. Use environment variables or configuration files.",
                "lineNumber": 12,
                "codeSnip": "10 public class AppConfig {\n11 \n12     private static final String DB_HOST = \"192.168.1.100\";\n13     private static final int DB_PORT = 5432;\n14 \n",
                "variables": {}
              }
            ]
          },
          "session-00001": {
            "description": "HTTP session usage detected\nThe application uses HTTP sessions for state management. In a cloud environment with multiple instances, sessions need to be externalized to a shared store.",
            "category": "optional",
            "effort": 7,
            "labels": [
              "konveyor.io/target=cloud-readiness"
            ],
            "links": [
              {
                "title": "Session Management in Cloud Environments",
                "url": "https://12factor.net/processes"
              }
            ],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/rest/AuthResource.java",
                "message": "HTTP session used for storing user state. Consider using JWT tokens or Redis-backed sessions.",
                "lineNumber": 22,
                "codeSnip": "20     @POST\n21     public Response login(@FormParam(\"user\") String user) {\n22         HttpSession session = request.getSession(true);\n23         session.setAttribute(\"currentUser\", user);\n24         return Response.ok().build();\n25     }\n",
                "variables": {}
              }
            ]
          }
        },
        "insights": {
          "logging-00001": {
            "description": "Logging framework usage\nThe application uses a logging framework. Ensure logs are written to stdout/stderr for container environments rather than to log files.",
            "category": "potential",
            "labels": [
              "konveyor.io/target=cloud-readiness"
            ],
            "links": [
              {
                "title": "Twelve-Factor App: Logs",
                "url": "https://12factor.net/logs"
              }
            ],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/service/CustomerService.java",
                "message": "Logging framework detected. Verify logs are written to stdout/stderr.",
                "lineNumber": 8,
                "codeSnip": "6 @ApplicationScoped\n7 public class CustomerService {\n8     private static final Logger log = LoggerFactory.getLogger(CustomerService.class);\n9 \n10     @Inject\n",
                "variables": {}
              }
            ]
          }
        }
      },
      {
        "name": "technology-usage",
        "description": "Technology usage detection rules",
        "tags": [
          "Java EE",
          "EJB",
          "JPA",
          "JAX-RS",
          "CDI",
          "Category=Java EE Technologies"
        ],
        "violations": {},
        "insights": {
          "technology-usage-jpa-00001": {
            "description": "JPA technology usage detected\nThe application uses Java Persistence API (JPA) for database access.",
            "category": "potential",
            "labels": [
              "konveyor.io/source=java-ee"
            ],
            "links": [],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/model/Customer.java",
                "message": "JPA Entity annotation found",
                "lineNumber": 9,
                "codeSnip": "8 \n9 @Entity\n10 @Table(name = \"customers\")\n11 public class Customer {\n",
                "variables": {}
              },
              {
                "uri": "file:///src/main/java/com/example/model/Order.java",
                "message": "JPA Entity annotation found",
                "lineNumber": 9,
                "codeSnip": "8 \n9 @Entity\n10 @Table(name = \"orders\")\n11 public class Order {\n",
                "variables": {}
              }
            ]
          },
          "technology-usage-cdi-00001": {
            "description": "CDI technology usage detected\nThe application uses Contexts and Dependency Injection (CDI).",
            "category": "potential",
            "labels": [
              "konveyor.io/source=java-ee"
            ],
            "links": [],
            "incidents": [
              {
                "uri": "file:///src/main/java/com/example/service/CustomerService.java",
                "message": "CDI @ApplicationScoped annotation found",
                "lineNumber": 6,
                "codeSnip": "5 \n6 @ApplicationScoped\n7 public class CustomerService {\n",
                "variables": {}
              }
            ]
          }
        }
      }
    ],
    "depItems": [
      {
        "fileURI": "pom.xml",
        "provider": "java",
        "dependencies": [
          {
            "name": "javax.javaee-api",
            "fileURIPrefix": "file:///",
            "indirect": false,
            "labels": [
              "konveyor.io/source=downloadable",
              "konveyor.io/language=java"
            ],
            "resolvedIdentifier": "a1e0c6d3b7f8e9d0",
            "version": "8.0"
          },
          {
            "name": "org.hibernate:hibernate-core",
            "fileURIPrefix": "file:///",
            "indirect": false,
            "labels": [
              "konveyor.io/source=open-source",
              "konveyor.io/language=java"
            ],
            "resolvedIdentifier": "b2f1d4e5c8a7b6c3",
            "version": "5.6.15.Final"
          },
          {
            "name": "org.postgresql:postgresql",
            "fileURIPrefix": "file:///",
            "indirect": false,
            "labels": [
              "konveyor.io/source=open-source",
              "konveyor.io/language=java"
            ],
            "resolvedIdentifier": "c3a2b5d6e9f0c7d4",
            "version": "42.7.1"
          },
          {
            "name": "org.slf4j:slf4j-api",
            "fileURIPrefix": "file:///",
            "indirect": true,
            "labels": [
              "konveyor.io/source=open-source",
              "konveyor.io/language=java"
            ],
            "resolvedIdentifier": "d4b3c6e7f0a1d8e5",
            "version": "2.0.9"
          },
          {
            "name": "com.fasterxml.jackson.core:jackson-databind",
            "fileURIPrefix": "file:///",
            "indirect": false,
            "labels": [
              "konveyor.io/source=open-source",
              "konveyor.io/language=java"
            ],
            "resolvedIdentifier": "e5c4d7f8a1b2e9f6",
            "version": "2.16.1"
          },
          {
            "name": "io.smallrye:smallrye-config",
            "fileURIPrefix": "file:///",
            "indirect": true,
            "labels": [
              "konveyor.io/source=open-source",
              "konveyor.io/language=java"
            ],
            "resolvedIdentifier": "f6d5e8a9b2c3f0a7",
            "version": "3.4.4"
          }
        ]
      }
    ],
    "files": {
      "file:///src/main/java/com/example/model/Customer.java": "package com.example.model;\n\nimport javax.persistence.Entity;\nimport javax.persistence.Table;\nimport javax.persistence.Id;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.Column;\n\n@Entity\n@Table(name = \"customers\")\npublic class Customer {\n\n    @Id\n    @GeneratedValue\n    private Long id;\n\n    @Column(nullable = false)\n    private String name;\n\n    @Column(unique = true)\n    private String email;\n\n    @Column\n    private String phone;\n\n    public Customer() {}\n\n    public Customer(String name, String email) {\n        this.name = name;\n        this.email = email;\n    }\n\n    public Long getId() { return id; }\n    public String getName() { return name; }\n    public void setName(String name) { this.name = name; }\n    public String getEmail() { return email; }\n    public void setEmail(String email) { this.email = email; }\n    public String getPhone() { return phone; }\n    public void setPhone(String phone) { this.phone = phone; }\n}\n",
      "file:///src/main/java/com/example/model/Order.java": "package com.example.model;\n\nimport javax.persistence.Entity;\nimport javax.persistence.Table;\nimport javax.persistence.Id;\nimport javax.persistence.ManyToOne;\nimport javax.persistence.JoinColumn;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.Column;\nimport javax.persistence.Temporal;\nimport javax.persistence.TemporalType;\nimport java.util.Date;\n\n@Entity\n@Table(name = \"orders\")\npublic class Order {\n\n    @Id\n    @GeneratedValue\n    private Long id;\n\n    @Column(nullable = false)\n    private String description;\n\n    @Column\n    private Double amount;\n\n    @Temporal(TemporalType.TIMESTAMP)\n    private Date createdAt;\n\n    @ManyToOne\n    @JoinColumn(name = \"customer_id\")\n    private Customer customer;\n\n    public Order() {}\n\n    public Long getId() { return id; }\n    public String getDescription() { return description; }\n    public void setDescription(String desc) { this.description = desc; }\n    public Double getAmount() { return amount; }\n    public void setAmount(Double amount) { this.amount = amount; }\n    public Customer getCustomer() { return customer; }\n    public void setCustomer(Customer customer) { this.customer = customer; }\n}\n",
      "file:///src/main/java/com/example/service/CustomerService.java": "package com.example.service;\n\nimport javax.inject.Inject;\nimport javax.enterprise.context.ApplicationScoped;\n\n@ApplicationScoped\npublic class CustomerService {\n    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);\n\n    @Inject\n    private CustomerRepository repository;\n\n    public List<Customer> getAll() {\n        return repository.findAll();\n    }\n\n    public Customer getById(Long id) {\n        return repository.findById(id);\n    }\n\n    public Customer create(Customer customer) {\n        log.info(\"Creating customer: {}\", customer.getName());\n        return repository.save(customer);\n    }\n\n    public void delete(Long id) {\n        repository.delete(id);\n    }\n}\n",
      "file:///src/main/java/com/example/repository/CustomerRepository.java": "package com.example.repository;\n\nimport javax.persistence.EntityManager;\nimport javax.persistence.PersistenceContext;\nimport javax.persistence.TypedQuery;\nimport javax.enterprise.context.ApplicationScoped;\nimport java.util.List;\nimport com.example.model.Customer;\n\n@ApplicationScoped\npublic class CustomerRepository {\n\n    @PersistenceContext\n    private EntityManager em;\n\n    public List<Customer> findAll() {\n        TypedQuery<Customer> query = em.createQuery(\n            \"SELECT c FROM Customer c ORDER BY c.name\", Customer.class);\n        return query.getResultList();\n    }\n\n    public Customer findById(Long id) {\n        return em.find(Customer.class, id);\n    }\n\n    public Customer save(Customer customer) {\n        em.persist(customer);\n        return customer;\n    }\n\n    public void delete(Long id) {\n        Customer customer = findById(id);\n        if (customer != null) {\n            em.remove(customer);\n        }\n    }\n}\n",
      "file:///src/main/java/com/example/rest/CustomerResource.java": "package com.example.rest;\n\nimport java.util.List;\nimport javax.ws.rs.*;\nimport javax.inject.Inject;\nimport javax.ws.rs.core.MediaType;\nimport javax.ws.rs.core.Response;\nimport com.example.model.Customer;\nimport com.example.service.CustomerService;\n\n@Path(\"/customers\")\n@Produces(MediaType.APPLICATION_JSON)\n@Consumes(MediaType.APPLICATION_JSON)\npublic class CustomerResource {\n\n    @Inject\n    private CustomerService service;\n\n    @GET\n    public List<Customer> getAll() {\n        return service.getAll();\n    }\n\n    @GET\n    @Path(\"/{id}\")\n    public Customer getById(@PathParam(\"id\") Long id) {\n        return service.getById(id);\n    }\n\n    @POST\n    public Response create(Customer customer) {\n        Customer created = service.create(customer);\n        return Response.status(Response.Status.CREATED).entity(created).build();\n    }\n\n    @DELETE\n    @Path(\"/{id}\")\n    public Response delete(@PathParam(\"id\") Long id) {\n        service.delete(id);\n        return Response.noContent().build();\n    }\n}\n",
      "file:///src/main/java/com/example/rest/OrderResource.java": "package com.example.rest;\n\nimport javax.ws.rs.*;\nimport javax.ws.rs.core.MediaType;\nimport javax.ws.rs.core.Response;\nimport javax.inject.Inject;\nimport com.example.model.Order;\n\n@Path(\"/orders\")\n@Produces(MediaType.APPLICATION_JSON)\n@Consumes(MediaType.APPLICATION_JSON)\npublic class OrderResource {\n\n    @Inject\n    private OrderService orderService;\n\n    @GET\n    public Response listOrders() {\n        return Response.ok(orderService.findAll()).build();\n    }\n}\n",
      "file:///src/main/java/com/example/rest/AuthResource.java": "package com.example.rest;\n\nimport javax.ws.rs.*;\nimport javax.ws.rs.core.Response;\nimport javax.servlet.http.HttpServletRequest;\nimport javax.servlet.http.HttpSession;\nimport javax.ws.rs.core.Context;\n\n@Path(\"/auth\")\npublic class AuthResource {\n\n    @Context\n    private HttpServletRequest request;\n\n    @POST\n    @Path(\"/login\")\n    @Consumes(\"application/x-www-form-urlencoded\")\n    public Response login(@FormParam(\"user\") String user,\n                          @FormParam(\"password\") String password) {\n        // Simplified auth for demo purposes\n        HttpSession session = request.getSession(true);\n        session.setAttribute(\"currentUser\", user);\n        return Response.ok().build();\n    }\n\n    @POST\n    @Path(\"/logout\")\n    public Response logout() {\n        HttpSession session = request.getSession(false);\n        if (session != null) {\n            session.invalidate();\n        }\n        return Response.ok().build();\n    }\n}\n",
      "file:///src/main/java/com/example/service/FileExportService.java": "package com.example.service;\n\nimport javax.enterprise.context.ApplicationScoped;\nimport java.io.File;\nimport java.io.FileWriter;\nimport java.io.IOException;\nimport java.nio.file.Files;\nimport java.nio.file.Path;\nimport java.nio.file.Paths;\nimport java.util.UUID;\nimport java.util.stream.Stream;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\n\n@ApplicationScoped\npublic class FileExportService {\n\n    private static final Logger log = LoggerFactory.getLogger(FileExportService.class);\n\n    public void exportReport(String data) {\n        File outputFile = new File(\"/tmp/reports/\" + UUID.randomUUID() + \".csv\");\n        try (FileWriter writer = new FileWriter(outputFile)) {\n            writer.write(data);\n        } catch (IOException e) {\n            log.error(\"Failed to write report\", e);\n        }\n    }\n\n    public void archiveLogs() {\n        Path logsDir = Paths.get(\"/var/log/app/\");\n        try (Stream<Path> paths = Files.walk(logsDir)) {\n            paths.filter(Files::isRegularFile)\n                 .forEach(this::compressFile);\n        } catch (IOException e) {\n            log.error(\"Failed to archive logs\", e);\n        }\n    }\n\n    private void compressFile(Path path) {\n        log.info(\"Compressing: {}\", path);\n    }\n}\n",
      "file:///src/main/java/com/example/config/AppConfig.java": "package com.example.config;\n\nimport javax.enterprise.context.ApplicationScoped;\nimport javax.annotation.PostConstruct;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\n\n@ApplicationScoped\npublic class AppConfig {\n\n    private static final Logger log = LoggerFactory.getLogger(AppConfig.class);\n    private static final String DB_HOST = \"192.168.1.100\";\n    private static final int DB_PORT = 5432;\n\n    @PostConstruct\n    public void init() {\n        log.info(\"Connecting to database at {}:{}\", DB_HOST, DB_PORT);\n    }\n\n    public String getDbHost() { return DB_HOST; }\n    public int getDbPort() { return DB_PORT; }\n}\n",
      "file:///pom.xml": "<project xmlns=\"http://maven.apache.org/POM/4.0.0\"\n         xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n         xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd\">\n    <modelVersion>4.0.0</modelVersion>\n    <groupId>com.example</groupId>\n    <artifactId>customer-service</artifactId>\n    <version>1.0.0-SNAPSHOT</version>\n    <packaging>war</packaging>\n\n    <properties>\n        <maven.compiler.source>11</maven.compiler.source>\n        <maven.compiler.target>11</maven.compiler.target>\n    </properties>\n\n    <dependencies>\n        <dependency>\n            <groupId>javax</groupId>\n            <artifactId>javaee-api</artifactId>\n            <version>8.0</version>\n            <scope>provided</scope>\n        </dependency>\n        <dependency>\n            <groupId>org.hibernate</groupId>\n            <artifactId>hibernate-core</artifactId>\n            <version>5.6.15.Final</version>\n        </dependency>\n        <dependency>\n            <groupId>org.postgresql</groupId>\n            <artifactId>postgresql</artifactId>\n            <version>42.7.1</version>\n        </dependency>\n        <dependency>\n            <groupId>com.fasterxml.jackson.core</groupId>\n            <artifactId>jackson-databind</artifactId>\n            <version>2.16.1</version>\n        </dependency>\n    </dependencies>\n</project>\n"
    }
  }
]
