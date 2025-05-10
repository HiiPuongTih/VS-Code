import { Injectable } from '@angular/core';

export interface Todo {
  id: number;
  title: string;
  dueDate?: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private todos: Todo[] = [];

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('todos');
      this.todos = saved ? JSON.parse(saved) : [];
    }
  }

  getTodos(): Todo[] {
    return this.todos;
  }

  addTodo(title: string, dueDate?: string): void {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      dueDate,
      completed: false
    };
    this.todos.push(newTodo);
    this.save();
  }

  toggleCompleted(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
    }
  }

  removeTodo(id: number): void {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
  }

  private save(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    }
  }
}
