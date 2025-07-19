import { Form } from "react-router-dom";

export default function Login() {
  return (
    <div>
      <h1>Login Page</h1>
      <div>
        <Form method="post">
          <label>
            Username:
            <input type="text" name="username" required />
          </label>
          <label>
            Password:
            <input type="password" name="password" required />
          </label>
          <button className="d-btn d-btn-primary" type="submit">
            Login
          </button>
        </Form>
      </div>
    </div>
  );
}
