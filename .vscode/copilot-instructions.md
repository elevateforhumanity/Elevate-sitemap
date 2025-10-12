# GitHub Copilot Instructions for Elevate for Humanity

## Project Context
This is the **Elevate for Humanity** enrollment and credentialing platform. It helps students enroll in workforce development programs with government compliance features.

## Code Style Guidelines

### React Components
- Use functional components with hooks
- Use TypeScript for type safety
- Follow naming convention: `ComponentName.tsx`
- Export components as default
- Keep components small and focused

### File Organization
- Components: `frontend/src/components/`
- Pages: `public/pages/`
- Utilities: `scripts/utilities/`
- Services: `services/`
- Types: `src/types/`

### Naming Conventions
- Components: PascalCase (e.g., `VideoInterview.tsx`)
- Files: kebab-case (e.g., `enrollment-workflow.ts`)
- Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### TypeScript
- Always use explicit types
- Avoid `any` type
- Use interfaces for object shapes
- Use type aliases for unions/intersections

### React Best Practices
- Use `useState` for local state
- Use `useEffect` for side effects
- Use `useMemo` for expensive computations
- Use `useCallback` for function memoization
- Destructure props in function signature

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use semantic HTML elements
- Ensure WCAG 2.1 AA accessibility

### Comments
- Document "why" not "what"
- Use JSDoc for functions
- Add TODO comments for future work
- Keep comments concise

### Security
- Never commit API keys or secrets
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS for all external requests
- Follow FERPA compliance for student data

### Performance
- Lazy load components when possible
- Optimize images (WebP format)
- Minimize bundle size
- Use code splitting
- Cache API responses

### Testing
- Write unit tests for utilities
- Write integration tests for components
- Test error states
- Test accessibility

### Git Commits
- Use conventional commits format
- Keep commits atomic and focused
- Write descriptive commit messages
- Reference issue numbers when applicable

## Project-Specific Guidelines

### Enrollment System
- Always validate student eligibility
- Track enrollment steps (1-4)
- Store data in Supabase
- Send confirmation emails
- Log all actions for compliance

### Video Interviews
- Use MediaRecorder API
- Support camera/microphone permissions
- Allow retakes
- Upload to secure storage
- Compress videos before upload

### Calendly Integration
- Use inline widget (no iframes)
- Pre-fill student information
- Track scheduling events
- Send reminders

### Government Compliance
- Follow FERPA guidelines
- Maintain audit logs
- Encrypt sensitive data
- Implement data retention policies
- Support WIOA reporting

### API Integration
- Use environment variables for URLs
- Handle errors gracefully
- Implement retry logic
- Add request timeouts
- Log API calls

## Common Patterns

### Form Handling
```typescript
const [formData, setFormData] = useState<FormData>({});
const [errors, setErrors] = useState<FormErrors>({});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Validate
  // Submit
  // Handle response
};
```

### API Calls
```typescript
const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <Component />
</ErrorBoundary>
```

## Deployment Targets
- **Cloudflare Pages**: Static site hosting
- **Render.com**: Backup hosting
- **Supabase**: Database and authentication

## Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public API key
- `VITE_API_BASE_URL`: API endpoint

## Key Features to Maintain
1. 4-step enrollment workflow
2. Calendly scheduling integration
3. Video interview recording
4. Government compliance tracking
5. SEO optimization
6. Mobile responsiveness
7. Accessibility (WCAG 2.1 AA)
8. Security headers
9. Analytics tracking
10. Error handling

## When Suggesting Code
- Prioritize security and compliance
- Ensure mobile responsiveness
- Add proper error handling
- Include TypeScript types
- Follow existing patterns
- Consider performance
- Add helpful comments
- Test edge cases
