import Cookies from "js-cookie";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar: string | null;
  lastLogin: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthService {
  private static instance: AuthService;
  private user: User | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(
    email: string,
    password: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    this.user = data.user;

    // Set cookies for tokens
    Cookies.set("accessToken", data.tokens.accessToken, { expires: 1 / 96 }); // 15 mins
    Cookies.set("refreshToken", data.tokens.refreshToken, { expires: 7 });
    typeof window !== "undefined" &&
      localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  }

  public async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    this.user = null;
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    typeof window !== "undefined" && localStorage.removeItem("user");
  }

  public async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user;

    const savedUser =
      typeof window !== "undefined" && localStorage.getItem("user");
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
        return this.user;
      } catch (e) {
        typeof window !== "undefined" && localStorage.removeItem("user");
      }
    }

    return null;
  }

  public isAuthenticated(): boolean {
    return (
      !!Cookies.get("accessToken") ||
      (typeof window !== "undefined" && !!localStorage.getItem("user"))
    );
  }

  public hasPermission(permission: string): boolean {
    return this.user?.permissions.includes(permission) || false;
  }

  public hasRole(role: string): boolean {
    return this.user?.role === role;
  }
}
