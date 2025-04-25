# ToastYourTime

Calculate and display milestone dates for life events.

## Getting Started

To get started, take a look at src/app/page.tsx.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Docker

The application can be run using Docker:

### Using Docker Compose (recommended)

```bash
# Build and start the container
docker-compose up -d

# Stop the container
docker-compose down
```

### Using Docker directly

```bash
# Build the Docker image
docker build -t toastyourtime .

# Run the container
docker run -p 3000:3000 toastyourtime
```

Access the application at http://localhost:3000.
