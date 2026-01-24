# CLAUDE.md Template: React/Next.js Development

**Framework**: React/Next.js {{NEXTJS_VERSION}}
**Styling**: {{STYLING}} (Tailwind/CSS Modules)
**State Management**: {{STATE_MGMT}} (Zustand/Redux)
**Package Manager**: npm/yarn/pnpm

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Next.js Version**: {{NEXTJS_VERSION}} (13+)
- **React Version**: 18+
- **Styling**: {{STYLING}}
- **Deployment**: {{DEPLOYMENT}}

## 🔧 React/Next.js Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── features/
│   │   └── layouts/
│   ├── app/ (Next.js 13+ App Router)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   └── api/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── utils.ts
│   ├── styles/
│   ├── types/
│   └── context/
├── public/
├── tests/
├── package.json
├── next.config.js
└── tsconfig.json
```

## 🚀 Next.js Setup

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.example.com'],
    unoptimized: process.env.UNOPTIMIZED === 'true',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
```

### React Component Example
```typescript
// components/features/UserList.tsx
'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Next.js API Route
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "react-patterns-{{PROJECT_NAME}}" \
  --value "Component patterns, hooks usage, state management" \
  --namespace frontend --tags "react,patterns"
```

## ✅ Testing Strategy

### Vitest & Testing Library
```typescript
// components/__tests__/UserList.test.tsx
import { render, screen } from '@testing-library/react';
import { UserList } from '../UserList';

describe('UserList', () => {
  it('renders user list', async () => {
    render(<UserList />);

    const users = await screen.findAllByRole('listitem');
    expect(users.length).toBeGreaterThan(0);
  });
});
```

## 🎯 Performance Targets

- Page load: <2s (FCP <1.5s)
- LCP: <2.5s
- CLS: <0.1
- TTI: <3.5s

## 📋 React/Next.js Checklist

- [ ] Next.js project scaffolded
- [ ] TypeScript configured
- [ ] Styling system set up
- [ ] Component library established
- [ ] Routing configured
- [ ] API routes created
- [ ] State management configured
- [ ] Authentication implemented
- [ ] Testing framework configured
- [ ] Performance optimized
- [ ] SEO configured (for Next.js)
- [ ] Deployment configured
- [ ] Monitoring configured

---

**Generated from**: claude-flow CLAUDE.md React/Next.js Template
