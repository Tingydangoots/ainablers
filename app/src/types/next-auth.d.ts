import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      persona: string
    }
  }

  interface User {
    role: string
    persona: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    persona: string
  }
}
