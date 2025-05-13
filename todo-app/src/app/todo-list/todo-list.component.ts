
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../todo.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartRef!: ElementRef;
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  newTitle: string = '';
  newDueDate: string = '';
  todoCounts = { todo: 0, completed: 0, overdue: 0 };
  selectedDate: string = '';
  editingTodo: Todo | null = null;
  originalTodo: Todo | null = null;
  editedTitle = '';
  editedDueDate = '';
  weekDates: { label: string; value: string }[] = [];
  currentWeek: Date[] = [];
  chart: any;
  currentDate = new Date();





  constructor(private todoService: TodoService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    this.generateWeekDates();
    this.todos = this.todoService.getTodos();
    this.filteredTodos = [...this.todos];
    this.updateCounts();

  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeChart();
    }
  }

  updateCounts() {
    this.todoCounts = this.todoService.getStatusCounts();
  }

  get formattedDate(): string {
    return new DatePipe('en-US').transform(this.selectedDate, 'EEEE d MMMM y') || '';
  }

  addTodo() {
    if (this.newTitle.trim()) {
      this.todoService.addTodo(this.newTitle.trim(), this.newDueDate || undefined);
      this.todos = this.todoService.getTodos();
      this.filteredTodos = [...this.todos];
      this.updateCounts();
      this.newTitle = '';
      this.newDueDate = '';
    }
  }


  remove(id: number) {
    this.todoService.removeTodo(id);
    this.todos = this.todoService.getTodos();
    this.filteredTodos = this.filteredTodos.filter(t => t.id !== id);
    this.updateCounts();
  }

  toggleStatus(todo: Todo) {
    todo.completed = !todo.completed;
    this.todoService.updateTodo(todo);
    this.updateCounts();
    this.updateChart();
  }
  updateChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.initializeChart();
  }


  getStatusClass(todo: Todo): string {
    if (todo.completed) return 'completed';
    if (todo.dueDate && new Date(todo.dueDate) < new Date()) return 'overdue';
    return 'pending';
  }

  getStatusText(todo: Todo): string {
    if (todo.completed) return 'Completed';
    if (todo.dueDate && new Date(todo.dueDate) < new Date()) return 'Overdue';
    return 'Pending';
  }

  startEdit(todo: Todo) {
    this.editingTodo = { ...todo };
    this.originalTodo = todo;
    this.editedTitle = todo.title;
    this.editedDueDate = todo.dueDate || '';
  }

  saveEdit() {
    if (this.editingTodo) {
      const updatedTodo = {
        ...this.editingTodo,
        title: this.editedTitle,
        dueDate: this.editedDueDate
      };
      this.todoService.updateTodo(updatedTodo);
      this.todos = this.todoService.getTodos();
      this.filterByDate();
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingTodo = null;
    this.editedTitle = '';
    this.editedDueDate = '';
  }

  generateWeekDates() {
    const datePipe = new DatePipe('en-US');
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    this.weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.weekDates.push({
        label: datePipe.transform(date, 'EEEE d MMMM y') || '',
        value: date.toISOString().split('T')[0] // Store as ISO date string
      });
    }

    this.selectedDate = this.weekDates[0].value;
  }

  filterByDate() {
    const selectedDateObj = new Date(this.selectedDate);

    this.filteredTodos = this.todos.filter(todo => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);

      return (
        todoDate.getFullYear() === selectedDateObj.getFullYear() &&
        todoDate.getMonth() === selectedDateObj.getMonth() &&
        todoDate.getDate() === selectedDateObj.getDate()
      );
    });

    this.updateCounts();
  }

  initializeChart() {
    const ctx = this.chartRef.nativeElement.getContext('2d');

    // Create new chart
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.getChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Days of Week'
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Number of Tasks'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  getChartData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      labels: days,
      datasets: [
        {
          label: 'To Do',
          data: this.getWeeklyCounts('todo'),
          backgroundColor: '#ff9800'
        },
        {
          label: 'Completed',
          data: this.getWeeklyCounts('completed'),
          backgroundColor: '#4CAF50'
        },
        {
          label: 'Overdue',
          data: this.getWeeklyCounts('overdue'),
          backgroundColor: '#f44336'
        }
      ]
    };
  }

  getWeeklyCounts(type: 'todo' | 'completed' | 'overdue'): number[] {
    const counts: number[] = [];
    const now = new Date();

    // Get current week dates
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayString = day.toISOString().split('T')[0];

      counts.push(this.todoService.getTodos().filter(todo => {
        if (!todo.dueDate) return false;
        const matchesDay = todo.dueDate === dayString;
        const isOverdue = new Date(todo.dueDate) < now && !todo.completed;

        switch (type) {
          case 'todo': return !todo.completed && !isOverdue && matchesDay;
          case 'completed': return todo.completed && matchesDay;
          case 'overdue': return isOverdue && matchesDay;
          default: return false;
        }
      }).length);
    }
    return counts;
  }


}