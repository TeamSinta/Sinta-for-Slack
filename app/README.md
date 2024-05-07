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

### For production mode, run:

```bash
npm run build
npm start
