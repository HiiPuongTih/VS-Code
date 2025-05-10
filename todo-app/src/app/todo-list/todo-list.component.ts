import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent {
  todos: Todo[] = [];
  newTitle: string = '';
  newDueDate: string = '';

  constructor(private todoService: TodoService) {
    this.todos = this.todoService.getTodos();
  }

  addTodo() {
    if (this.newTitle.trim()) {
      this.todoService.addTodo(this.newTitle.trim(), this.newDueDate || undefined);
      this.todos = this.todoService.getTodos();
      this.newTitle = '';
      this.newDueDate = '';
    }
  }

  toggle(id: number) {
    this.todoService.toggleCompleted(id);
    this.todos = this.todoService.getTodos();
  }

  remove(id: number) {
    this.todoService.removeTodo(id);
    this.todos = this.todoService.getTodos();
  }
}
