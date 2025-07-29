Signal didn’t trigger my logic in ngOnInit, here’s what I learned.



So, I was using a signal from a service to trigger some changes in my component. Along with that, I had a few local variables I wanted to update when that signal changed.



Now, unlike Observables, signals don’t trigger lifecycle hooks or re-render the component. That caught me off guard.



Here’s what I had:

// In the service

```ts
export class MyService {

 private _trigger = signal(false);

 trigger$ = this._trigger.asReadonly();



 fireChange() {

  this._trigger.set(true);

 }

}



In the component, I initially tried:
<pre lang="markdown">

```ts
ngOnInit() {
  const value = this.myService.trigger$(); // Doesn’t react to changes
  this.localVar = value;
}
```
</pre>




This didn’t work. Nothing happened when the signal value changed, because ngOnInit doesn’t re-run when a signal updates.





What worked instead?



Option 1: Use effect() in the constructor

<pre lang="markdown">

```ts

constructor(private myService: MyService) {

 effect(() => {

  const updated = this.myService.trigger$();

  this.localVar = updated;

  // do other stuff here

 });

}

```
</pre>

This runs every time the signal updates , kind of like a reactive watcher.

Option 2: Use a computed() signal

<pre lang="markdown">

```ts

myDerived = computed(() => {

 const updated = this.myService.trigger$();

 this.localVar = doSomething(updated);

 return updated;

});
```
<pre>


This creates a derived signal — you can bind to it in the template or consume it elsewhere.



So, what is a signal anyway?



A signal is a reactive value holder in Angular. It tracks dependencies and re-evaluates when its source changes — like a lightweight, synchronous alternative to BehaviorSubject but without subscriptions.



More here: https://angular.dev/guide/signals





TL;DR



Signals don’t auto-trigger logic inside ngOnInit

Use effect() for side-effects when a signal changes

Use computed() to derive values reactively



#Angular #Signals #ReactiveProgramming
