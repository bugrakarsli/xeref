
import os, textwrap

BASE = os.path.expanduser("~/xeref-design-app")
files = {}

# package.json
files["package.json"] = """{
  "name": "xeref-design",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.47.10",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "next": "15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.2",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.3.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^4.1.3",
    "typescript": "^5"
  }
}
"""

# next.config.ts
files["next.config.ts"] = '''import type { NextConfig } from "next";
const nextConfig: NextConfig = { experimental: { typedRoutes: true } };
export default nextConfig;
'''

# tsconfig.json
files["tsconfig.json"] = """{
  "compilerOptions": {
    "target": "ES2017","lib":["dom","dom.iterable","esnext"],"allowJs":true,
    "skipLibCheck":true,"strict":true,"noEmit":true,"esModuleInterop":true,
    "module":"esnext","moduleResolution":"bundler","resolveJsonModule":true,
    "isolatedModules":true,"jsx":"preserve","incremental":true,
    "plugins":[{"name":"next"}],"paths":{"@/*":["./src/*"]}
  },
  "include":["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"],
  "exclude":["node_modules"]
}
"""

# tailwind.config.ts
files["tailwind.config.ts"] = '''import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:"var(--bg)", surface:"var(--surface)", "surface-soft":"var(--surface-soft)",
        "surface-muted":"var(--surface-muted)", border:"var(--border)",
        "border-strong":"var(--border-strong)", text:"var(--text)", muted:"var(--muted)",
        faint:"var(--faint)", accent:"var(--accent)", "accent-hover":"var(--accent-hover)",
        "accent-soft":"var(--accent-soft)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
'''

# .env.local.example
files[".env.local.example"] = """NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
"""

print(f"Root config files: {len(files)}")

for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path) if os.path.dirname(full_path) else BASE, exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print("Root files written")
