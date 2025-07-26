import { SidebarView } from './../interface/interface';
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private activeSidebarSubject = new BehaviorSubject<SidebarView>(null);
  activeSidebar$ = this.activeSidebarSubject.asObservable();

  get current(): SidebarView {
    return this.activeSidebarSubject.getValue();
  }

  close(view: SidebarView) {
    this.activeSidebarSubject.next(view);
  }

  open(view: SidebarView) {
    this.activeSidebarSubject.next(view);
  }

  toggleSidebar(view: SidebarView) {
    const current = this.current;
    this.activeSidebarSubject.next(current === view ? null : view);
  }

  get isOpen() {

     return this.current === null ? false : true;

  }
}
