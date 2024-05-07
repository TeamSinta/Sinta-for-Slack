## Running the Sinta Slack App Locally

To run the Sinta Slack app locally on your machine, follow these steps:

### Prerequisites

1. Install Docker on your machine. You can find the installation guide [here](https://docs.docker.com/engine/install/).
2. Clone the Sinta repository to your local machine.

### Instructions

1. **Start the Database Container:**

   Run the following script in your terminal to start a Docker container for the local development database:

   ```bash
   ./start-database.sh
### Set up Environment Variables:

Copy the contents of the `.env.example` file into a new file named `.env` in the root directory of the project. Update the necessary environment variables with your own values. These variables include database URL, Next Auth secrets, Slack client ID, Slack client secret, etc.

### Build and Run the Application:

You can now build and run the application using the provided npm scripts. For development mode, run:

```bash
npm run dev
```

### For production mode, run:

```bash
npm run build
npm start
``` 

**Linting and Formatting**

**ESLint**

ESLint is a static code analysis tool for identifying problematic patterns found in JavaScript code. It helps ensure code quality and consistency.

**Linting**

To lint your code using ESLint, run the following command:

```
npm run lint
```

This command will check your code for any ESLint errors according to the ESLint configuration in your project.

**Fixing ESLint Errors**

To automatically fix ESLint errors where possible, run the following command:

```
npm run lint-fix
```

This command will attempt to fix ESLint errors automatically and update your code accordingly.

**Prettier**

Prettier is a code formatter that helps maintain a consistent coding style across your project.

**Formatting**

To format your code using Prettier, run the following command:

```
npm run prettier
```

This command will format your code according to the Prettier configuration specified in your project.

---

Let me know if there's anything else you need!
