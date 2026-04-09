# CLAUDE.md Template: Java/Spring Development

**Language**: Java {{JAVA_VERSION}} (17+)
**Framework**: Spring Boot {{SPRING_VERSION}}
**Build Tool**: {{BUILD_TOOL}} (Maven/Gradle)
**Database**: {{DATABASE}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Java Version**: {{JAVA_VERSION}}
- **Spring Boot**: {{SPRING_VERSION}}
- **Build Tool**: {{BUILD_TOOL}}
- **Database**: {{DATABASE}}

## 🔧 Spring Boot Project Structure

```
project/
├── src/
│   ├── main/
│   │   ├── java/com/example/
│   │   │   ├── Application.java
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── model/
│   │   │   ├── dto/
│   │   │   └── config/
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── db/migration/
│   └── test/
│       └── java/com/example/
├── pom.xml (or build.gradle)
└── README.md
```

## 🚀 Spring Boot Setup

### Maven pom.xml
```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.0.0</version>
</parent>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
  </dependency>
</dependencies>

<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

### Spring Application Example
```java
// Application.java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// UserController.java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

// UserService.java
@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        // Hash password, validate, etc.

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(this::mapToDTO);
    }
}

// UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

## ✅ Testing Strategy

### JUnit 5 & Mockito Tests
```java
@SpringBootTest
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void testCreateUser() {
        CreateUserRequest request = new CreateUserRequest("test@example.com", "Test User");
        User user = new User();
        user.setId(1L);

        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDTO result = userService.createUser(request);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
    }
}
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "spring-patterns-{{PROJECT_NAME}}" \
  --value "Dependency injection, JPA patterns, transaction management" \
  --namespace java --tags "spring,patterns"
```

## 🎯 Performance Targets

- Server startup: <5s
- Average response: <200ms
- Memory: <500MB
- Database queries: <100ms

## 📋 Java/Spring Checklist

- [ ] Project scaffolded with Spring Boot
- [ ] Database configured
- [ ] Entity and repository layers created
- [ ] Service layer implemented
- [ ] REST controllers created
- [ ] Exception handling configured
- [ ] Validation configured
- [ ] Testing framework set up
- [ ] Logging configured
- [ ] Security configured
- [ ] API documentation (Springdoc) added
- [ ] Deployment configured

---

**Generated from**: claude-flow CLAUDE.md Java/Spring Template
