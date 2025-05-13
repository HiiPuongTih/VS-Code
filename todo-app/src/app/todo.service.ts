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


  getStatusCounts() {
    const now = new Date();
    return {
      todo: this.todos.filter(t =>
        !t.completed &&
        t.dueDate &&
        new Date(t.dueDate) > now
      ).length,
      completed: this.todos.filter(t => t.completed).length,
      overdue: this.todos.filter(t =>
        !t.completed &&
        t.dueDate &&
        new Date(t.dueDate) < now
      ).length
    };
  }

  removeTodo(id: number): void {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
  }


  updateTodo(updatedTodo: Todo): void {
    const index = this.todos.findIndex(t => t.id === updatedTodo.id);
    if (index > -1) {
      this.todos[index] = updatedTodo;
      this.save();
    }
  }

  getTodosByDay(day: Date): Todo[] {
    return this.todos.filter(t =>
      t.dueDate === this.formatDate(day)
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private save(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    }
  }
}
