import React, { createContext, useContext, useReducer, useMemo, useCallback, useState } from "react";
import _ from "lodash";
import "./td.css";

interface Data {
  id: number;
  value: string;
  completed: boolean;
}

type Todo = "all" | "active" | "completed";

type Action =
  | { type: "ADD_TODO"; payload: string }
  | { type: "TOGGLE_TODO"; payload: number }
  | { type: "REMOVE_TODO"; payload: number }
  | { type: "SET_COMPLETED"; payload: boolean }
  | { type: "CLEAR_COMPLETED" };

interface TodoContextType {
  data: Data[];
  addTodo: (value: string) => void;
  toggleTodo: (id: number) => void;
  removeTodo: (id: number) => void;
  setCompleted: (completed: boolean) => void;
  clearCompleted: () => void;
  setFilter: (option: Todo) => void;
}

const initialState: Data[] = [];

const TodoReducer = (state: Data[], action: Action): Data[] => {
  switch (action.type) {
    case "ADD_TODO":
      return [
        ...state,
        {
          id: Math.random(),
          value: action.payload,
          completed: false,
        },
      ];
    case "TOGGLE_TODO":
      return _.map(state, (item) =>
        item.id === action.payload
          ? { ...item, completed: !item.completed }
          : item
      );
    case "REMOVE_TODO":
      return _.filter(state, (item) => item.id !== action.payload);
    case "SET_COMPLETED":
      return _.map(state, (item) => ({ ...item, completed: action.payload }));
    case "CLEAR_COMPLETED":
      return _.filter(state, (item) => !item.completed);
    default:
      return state;
  }
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, dispatch] = useReducer(TodoReducer, initialState);
  const [filter, setFilter] =useState<Todo>("all");

  const addTodo = useCallback((value: string) => {
    if (value.trim()) {
      dispatch({ type: "ADD_TODO", payload: value.trim() });
    }
  }, [dispatch]);

  const toggleTodo = useCallback((id: number) => {
    dispatch({ type: "TOGGLE_TODO", payload: id });
  }, []);

  const removeTodo = useCallback((id: number) => {
    dispatch({ type: "REMOVE_TODO", payload: id });
  }, [dispatch]);

  const setCompleted = useCallback((completed: boolean) => {
    dispatch({ type: "SET_COMPLETED", payload: completed });
  }, [dispatch]);

  const clearCompleted = useCallback(() => {
    dispatch({ type: "CLEAR_COMPLETED" });
  }, [dispatch]);

  const value = {
      data,
      addTodo,
      toggleTodo,
      removeTodo,
      setCompleted,
      clearCompleted,
      filter,
      setFilter, 
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodoContext = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodoContext must be used within a TodoProvider");
  }
  return context;
};

export const TodoApp = () => {
  const {
    data,
    addTodo,
    toggleTodo,
    removeTodo,
    setCompleted,
    clearCompleted,
  } = useTodoContext();

  const [value, setValue] = React.useState<string>("");
  const [filter, setFilter] = React.useState<Todo>("all");

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addTodo(value);
        setValue("");
      }
    },
    [addTodo, value]
  );

  const filteredData = useMemo(() => {
    if (filter === "active") {
      return _.filter(data, (item) => !item.completed);
    } else if (filter === "completed") {
      return _.filter(data, (item) => item.completed);
    } else {
      return data;
    }
  }, [data, filter]);

  const handleFilterChange = (item: Todo) => {
    setFilter(item);
  };

  return (
    <div className="header">
      <h1>todos</h1>
      <div className="div_input">
        <div>
          <input
            className="check"
            type="checkbox"
            onChange={(e) => setCompleted(e.target.checked)}
            checked={data.length > 0 && _.every(data, (item) => item.completed)}
          />
        </div>
        <div>
          <input
            type="text"
            value={value}
            onKeyDown={handleKeyPress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setValue(event.target.value)
            }
            placeholder="What needs to be done?"
          />
        </div>
      </div>
      <div>
        {_.map(filteredData, (item) => (
          <div key={item.id} className="todo-item">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleTodo(item.id)}
            />
            <span>{item.value}</span>
            <button className="todo-remove" onClick={() => removeTodo(item.id)}>
              x
            </button>
          </div>
        ))}
      </div>
      {data.length > 0 && (
        <div className="footer">
          <span className="todo-count">
            {_.filter(data, (item) => !item.completed).length} items left!
          </span>
          <button
            className="todo-all"
            onClick={() => handleFilterChange("all")}
          >
            All
          </button>
          <button
            className="todo-active"
            onClick={() => handleFilterChange("active")}
          >
            Active
          </button>
          <button
            className="todo-completed"
            onClick={() => handleFilterChange("completed")}
          >
            Completed
          </button>
          <button className="todo-clear-completed" onClick={clearCompleted}>
            Clear Completed
          </button>
        </div>
      )}
    </div>
  );
};
