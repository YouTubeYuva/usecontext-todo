import { TodoApp } from "./TodoApp/TodoApp";
import {TodoProvider} from "./TodoApp/TodoApp";

export default function App() {
  return (
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  );
}
