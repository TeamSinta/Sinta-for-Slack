#Sinta Slack App Onboarding Guide 
![Sinta Logo](https://assets-global.website-files.com/6457f112b965721ffc2b0777/6457f2617575798a80fbb8d5_Pasted%20Graphic%201.png)




**Running the Sinta Slack App Locally**

**Prerequisites:**
- Install Docker on your machine.
- Clone the Sinta repository to your local machine.

**Instructions:**
1. **Start the Database Container:**
   - Run `./start-database.sh` in your terminal to initiate a Docker container for the local development database.

2. **Set up Environment Variables:**
   - Copy the contents of `.env.example` into a new file named `.env` in the project's root directory.
   - Update the environment variables with your values (e.g., database URL, Next Auth secrets, Slack client ID, Slack client secret).

3. **Build and Run the Application:**
   - For development mode, execute `npm run dev`.
   - For production mode, execute:
     ```
     npm run build
     npm start
     ```

**Linting and Formatting**

**ESLint:**
- Use ESLint for static code analysis to identify problematic patterns in JavaScript code, ensuring code quality and consistency.
- To lint your code, run `npm run lint`.

**Fixing ESLint Errors:**
- Automatically fix ESLint errors with `npm run lint-fix`.

**Prettier:**
- Prettier is a code formatter that maintains a consistent coding style.
- Format your code using `npm run prettier`.

This streamlined guide aims to facilitate a quick and smooth onboarding process for developers joining the Sinta Slack app project. Let me know if you need further assistance!
