import { Component, Inject } from '@angular/core';

export interface DialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  imports: [],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialog {

  //   constructor(
  //   public dialogRef: MatDialogRef<ConfirmationDialog>,
  //   @Inject(MAT_DIALOG_DATA) public data: DialogData,
  // ) {}

  // onNoClick(): void {
  //   this.dialogRef.close(false);
  // }

}
