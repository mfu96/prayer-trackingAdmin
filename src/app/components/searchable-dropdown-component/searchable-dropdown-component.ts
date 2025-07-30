import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DropdownOption {
  id: any;
  name: string;
    [key: string]: any; // Bu, 'companyId' gibi herhangi bir ek özelliği kabul etmesini sağlar

  
}

@Component({
  selector: 'app-searchable-dropdown-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
    templateUrl: './searchable-dropdown-component.html',

 
    styleUrl: './searchable-dropdown-component.scss'
})
export class SearchableDropdownComponent implements OnChanges {
  @Input() options: DropdownOption[] = [];
  @Input() selectedId: any;
  @Input() placeholder: string = 'Seçim yapın...';
  @Output() selectionChange = new EventEmitter<any>();

  showOptions = false;
  filteredOptions: DropdownOption[] = [];
  selectedOptionName: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['selectedId']) {
      this.filteredOptions = this.options;
      this.setSelectedName();
    }
  }

 
  setSelectedName(): void {
    // DİKKAT: Ana bileşenden gelen 'selectedId' sayesinde bu fonksiyon doğru ismi bulacak.
    if (this.options && this.options.length > 0) {
      const selected = this.options.find(opt => opt.id == this.selectedId);
      this.selectedOptionName = selected ? selected.name : '';
    }
  }

  filterOptions(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredOptions = this.options.filter(opt => opt.name.toLowerCase().includes(term));
    this.selectedOptionName = (event.target as HTMLInputElement).value;
  }

  selectOption(option: DropdownOption): void {
    this.selectedId = option.id;
    this.selectedOptionName = option.name;
    this.showOptions = false;
    this.selectionChange.emit(option.id);
  }
}