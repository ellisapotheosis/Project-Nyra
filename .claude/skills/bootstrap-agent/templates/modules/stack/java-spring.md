# ☕ Java + Spring Boot Stack Module

## Tech Stack
- **Framework**: Spring Boot 3.2+
- **Language**: Java 21 (LTS)
- **Build Tool**: Maven 3.9+ / Gradle 8+
- **Database**: PostgreSQL with JPA/Hibernate
- **Testing**: JUnit 5 + Mockito + TestContainers
- **API Documentation**: SpringDoc OpenAPI 3

## Project Structure
```
{{appName}}/
├── src/
│   ├── main/
│   │   ├── java/com/{{orgSlug}}/{{appSlug}}/
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── controller/          # REST controllers
│   │   │   ├── service/             # Business logic
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── model/               # Domain entities
│   │   │   ├── dto/                 # Data transfer objects
│   │   │   ├── exception/           # Custom exceptions
│   │   │   ├── security/            # Security config
│   │   │   └── Application.java     # Main class
│   │   └── resources/
│   │       ├── application.yml      # Configuration
│   │       ├── application-dev.yml  # Dev config
│   │       └── db/migration/        # Flyway migrations
│   └── test/                         # Test files
├── pom.xml                          # Maven dependencies
└── Dockerfile                       # Container config
```

## Development Commands
```bash
# Development
{{devCommand}}

# Build
{{buildCommand}}

# Test
{{testCommand}}

# Package
mvn clean package

# Run with profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Code Conventions

### Package Structure
- `controller` - REST API endpoints
- `service` - Business logic, transactions
- `repository` - Database access (Spring Data JPA)
- `model` - JPA entities
- `dto` - Request/response DTOs
- `config` - Spring configuration
- `exception` - Custom exceptions and handlers

### Naming Conventions
- **Classes**: PascalCase (e.g., `UserService`)
- **Methods**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Packages**: lowercase (e.g., `com.nyra.service`)

### Controller Pattern
```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody @Valid CreateUserRequest request) {
        UserDTO created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

### Service Layer Pattern
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        log.info("Created user: {}", saved.getId());
        return userMapper.toDTO(saved);
    }
}
```

### Entity Pattern
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### Exception Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : ""
            ));
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("Validation failed", errors));
    }
}
```

### Configuration
```java
@Configuration
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(5))
            .build();
    }
}
```

### Testing Strategy
```java
// Unit tests with Mockito
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getUserById_Success() {
        // Given
        User user = User.builder().id(1L).name("Test").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // When
        UserDTO result = userService.getUserById(1L);

        // Then
        assertThat(result.getName()).isEqualTo("Test");
        verify(userRepository).findById(1L);
    }
}

// Integration tests with TestContainers
@SpringBootTest
@Testcontainers
class UserControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createUser_Success() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"email\":\"test@example.com\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Test"));
    }
}
```

### Best Practices
- Use constructor injection (via Lombok @RequiredArgsConstructor)
- Keep controllers thin - delegate to services
- Use DTOs for API requests/responses (don't expose entities)
- Implement proper exception handling
- Use transactions appropriately (@Transactional)
- Validate inputs with Bean Validation
- Use Lombok to reduce boilerplate
- Follow SOLID principles
- Write comprehensive tests (unit + integration)

### Security
- Use Spring Security for authentication/authorization
- Implement JWT token authentication
- Use BCrypt for password hashing
- Apply method-level security (@PreAuthorize, @Secured)
- Validate all inputs
- Implement CORS properly
- Use HTTPS in production

### Performance
- Use pagination for large result sets
- Implement caching with Spring Cache
- Optimize database queries (N+1 prevention)
- Use connection pooling (HikariCP)
- Monitor with Spring Actuator
- Profile slow endpoints

---
