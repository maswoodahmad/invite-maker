import { BehaviorSubject } from "rxjs";
import { SidebarView } from "../interface/interface";
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

  close() {
    this.activeSidebarSubject.next(null);
  }

  open(view: SidebarView) {
    this.activeSidebarSubject.next(view);
  }

  toggleSidebar(view: SidebarView) {
    const current = this.current;
    this.activeSidebarSubject.next(current === view ? null : view);
  }
}
