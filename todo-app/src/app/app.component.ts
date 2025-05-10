import { Component } from '@angular/core';
import { TodoListComponent } from './todo-list/todo-list.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'todo-app';
}
