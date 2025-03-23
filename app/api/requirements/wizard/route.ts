import { NextRequest, NextResponse } from "next/server";

// Pre-generated requirement templates by category
const requirementTemplates = {
  frontend: [
    {
      id: "fe1",
      title: "Responsive Design",
      description:
        "Ensure the UI is fully responsive across all device sizes (mobile, tablet, desktop)",
      details:
        "The application should use responsive design techniques to adapt layouts for different screen sizes. Media queries should be employed to ensure a good user experience on devices ranging from mobile phones to large desktop monitors.",
    },
    {
      id: "fe2",
      title: "Accessibility Compliance",
      description: "Implement WCAG 2.1 AA compliance for all components",
      details:
        "All UI components must meet WCAG 2.1 AA standards. This includes providing proper contrast ratios, keyboard navigation support, screen reader compatibility, and alternative text for images. Semantic HTML should be used appropriately.",
    },
    {
      id: "fe3",
      title: "Performance Optimization",
      description: "Optimize for fast load times and smooth interactions",
      details:
        "The application should load in under 3 seconds on average connections. Implement code splitting, lazy loading of components, and image optimization techniques. Use performance measurement tools to validate improvements.",
    },
  ],
  backend: [
    {
      id: "be1",
      title: "API Authentication",
      description:
        "Implement secure JWT-based authentication for all API endpoints",
      details:
        "Set up JWT-based authentication for all protected endpoints. Tokens should expire after 24 hours and include proper claims. Implement refresh token functionality to maintain user sessions securely.",
    },
    {
      id: "be2",
      title: "Database Optimization",
      description:
        "Optimize database queries for performance and add appropriate indexes",
      details:
        "Review and optimize all database queries. Identify slow queries using profiling tools and add appropriate indexes. Implement pagination for large data sets and ensure no N+1 query problems exist.",
    },
    {
      id: "be3",
      title: "Rate Limiting",
      description: "Add rate limiting to prevent abuse of API endpoints",
      details:
        "Implement rate limiting for all public API endpoints. Restrict to 100 requests per minute per IP address for anonymous users and 1000 requests per minute for authenticated users. Return appropriate 429 responses when limits are exceeded.",
    },
  ],
  mobile: [
    {
      id: "mo1",
      title: "Offline Support",
      description: "Implement offline capabilities with local data storage",
      details:
        "The mobile app should function with limited capabilities when offline. Implement local storage to cache important data and allow basic functionality without an internet connection. Sync data when the connection is restored.",
    },
    {
      id: "mo2",
      title: "Push Notifications",
      description: "Add support for push notifications for important updates",
      details:
        "Implement push notification support for both Android and iOS. Notifications should be used for important updates such as new messages, status changes, or reminders. Users should be able to manage notification preferences.",
    },
    {
      id: "mo3",
      title: "Device Compatibility",
      description: "Ensure compatibility with the last 3 major OS versions",
      details:
        "The app must be compatible with iOS 13+ and Android 10+. Test on multiple device sizes and ensure UI adapts appropriately. Handle permission requests properly on different OS versions.",
    },
  ],
  bug: [
    {
      id: "bug1",
      title: "Fix UI Rendering Issue",
      description: "Correct the visual defects in the user interface component",
      details:
        "The component is not rendering correctly in certain browsers or screen sizes. Identify the specific CSS or JavaScript issues causing the problem and implement a fix that works across all supported browsers and devices.",
    },
    {
      id: "bug2",
      title: "Resolve Data Loading Error",
      description: "Fix the error that occurs when loading data from the API",
      details:
        "Users encounter errors when attempting to load data from the API. Investigate the API endpoint, error handling, and data parsing to identify and resolve the root cause. Add proper error handling to improve user experience when issues occur.",
    },
    {
      id: "bug3",
      title: "Performance Bottleneck",
      description:
        "Identify and fix the performance issue in the specified module",
      details:
        "The application becomes slow when performing certain operations. Profile the code to identify bottlenecks, optimize algorithms, reduce unnecessary computations, and improve overall performance. Document performance improvements with metrics.",
    },
  ],
  security: [
    {
      id: "sec1",
      title: "Input Validation",
      description:
        "Implement comprehensive input validation to prevent injection attacks",
      details:
        "Add server-side input validation for all user inputs to prevent SQL injection, XSS, and other injection attacks. Use parameterized queries for database operations and sanitize all outputs displayed to users.",
    },
    {
      id: "sec2",
      title: "Auth Vulnerability Fix",
      description: "Address the vulnerability in the authentication system",
      details:
        "Fix the identified authentication vulnerability. Implement proper password hashing, secure token handling, and protection against brute force attacks. Add multi-factor authentication options for sensitive operations.",
    },
    {
      id: "sec3",
      title: "Security Headers Implementation",
      description: "Add security headers to all HTTP responses",
      details:
        "Configure the application to include security headers like Content-Security-Policy, X-XSS-Protection, X-Content-Type-Options, and Strict-Transport-Security. These headers help prevent various attacks including XSS, clickjacking, and MIME type confusion.",
    },
  ],
  database: [
    {
      id: "db1",
      title: "Schema Design",
      description: "Design efficient database schema with proper relationships",
      details:
        "Create a normalized database schema with appropriate foreign key relationships. Consider performance implications of the design and document all tables, columns, and relationships. Include indexes on frequently queried columns.",
    },
    {
      id: "db2",
      title: "Migration Scripts",
      description: "Create database migration scripts for version control",
      details:
        "Develop migration scripts to allow versioning of database schema changes. Scripts should be idempotent, include both up and down migrations, and be properly tested to ensure data integrity during updates.",
    },
    {
      id: "db3",
      title: "Query Optimization",
      description: "Optimize slow database queries for better performance",
      details:
        "Identify and optimize slow-performing queries. Use query plans to analyze performance bottlenecks, add appropriate indexes, and rewrite queries to be more efficient. Document performance improvements with metrics.",
    },
  ],
  testing: [
    {
      id: "test1",
      title: "Unit Test Coverage",
      description: "Increase unit test coverage to minimum 80%",
      details:
        "Write comprehensive unit tests to achieve at least 80% code coverage. Tests should verify both happy paths and edge cases. Mock external dependencies appropriately and ensure tests are fast and reliable.",
    },
    {
      id: "test2",
      title: "Integration Tests",
      description: "Add integration tests for key system components",
      details:
        "Create integration tests that verify the interaction between different components of the system. Tests should cover main user flows and critical business logic. Use appropriate testing frameworks and setup/teardown processes.",
    },
    {
      id: "test3",
      title: "End-to-End Testing",
      description:
        "Set up automated end-to-end tests for critical user journeys",
      details:
        "Implement automated E2E tests that simulate real user behavior for the most important user journeys. Tests should run in CI/CD pipeline and verify that the entire system works correctly from a user's perspective.",
    },
  ],
  devops: [
    {
      id: "devops1",
      title: "CI/CD Pipeline",
      description: "Set up continuous integration and deployment pipeline",
      details:
        "Establish a CI/CD pipeline that automatically builds, tests, and deploys code changes. Include code quality checks, security scanning, and automated testing in the pipeline. Document the process for developers to understand workflow.",
    },
    {
      id: "devops2",
      title: "Infrastructure as Code",
      description:
        "Convert infrastructure to code using Terraform or similar tool",
      details:
        "Convert manual infrastructure setup to Infrastructure as Code using Terraform or similar tools. Version control all infrastructure definitions and document the deployment process. Include proper secret management.",
    },
    {
      id: "devops3",
      title: "Monitoring Setup",
      description: "Implement comprehensive monitoring and alerting",
      details:
        "Set up monitoring for application performance, error rates, and system health. Configure alerting for critical issues and create dashboards for visualizing system status. Include logging configuration with appropriate log levels and formats.",
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toLowerCase() || "all";

    // Return templates for specific category or all categories if not specified
    if (category === "all") {
      return NextResponse.json(requirementTemplates);
    } else if (
      requirementTemplates[category as keyof typeof requirementTemplates]
    ) {
      return NextResponse.json({
        [category]:
          requirementTemplates[category as keyof typeof requirementTemplates],
      });
    } else {
      // Category not found
      return NextResponse.json(
        {
          error:
            "Invalid category. Available categories: frontend, backend, mobile, bug, security, database, testing, devops, or all",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching requirement templates:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
