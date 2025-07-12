import { UserService } from "../services/userService.js";

export const AuthController = {
  async register(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserService.register(email, password);
      res.status(201).json({ id: user.id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const token = UserService.login(email, password);
      res.json({ token });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
