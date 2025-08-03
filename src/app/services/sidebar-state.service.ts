import { SidebarView } from './../interface/interface';
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";

interface SidebarState {
  view: SidebarView;
  config?: any;
}

@Injectable({
  providedIn: 'root',
})
export class SidebarStateService {


  private activeSidebarSubject = new BehaviorSubject<SidebarState | null>(null);
  readonly activeSidebar$ = this.activeSidebarSubject.asObservable();

  // ✅ Get current sidebar view (or null)
  get current(): SidebarView | null {
    return this.activeSidebarSubject.getValue()?.view ?? null;
  }

  // ✅ Open with view + optional config
  open(view: SidebarView, config?: any): void {
    this.activeSidebarSubject.next({ view, config });
  }

  // ✅ Close only if the passed view matches the active one
  close(view: SidebarView): void {
    const current = this.activeSidebarSubject.getValue();
    if (current?.view === view) {
      this.activeSidebarSubject.next(null);
    }
  }

  // ✅ Toggle sidebar open/close
  toggleSidebar(view: SidebarView, config?: any): void {
    const current = this.activeSidebarSubject.getValue();
    if (current?.view === view) {
      this.activeSidebarSubject.next(null);
    } else {
      this.activeSidebarSubject.next({ view, config });
    }
  }

  // ✅ Boolean flag for open state
  get isOpen(): boolean {
    return this.activeSidebarSubject.getValue() !== null;
  }

  // ✅ Optional getter to get full config
  get config(): any {
    return this.activeSidebarSubject.getValue()?.config;
  }
}
