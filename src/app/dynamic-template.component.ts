import { CommonModule } from '@angular/common';
import '@angular/compiler';
import {
  Compiler,
  Component,
  ComponentRef,
  Injector,
  NgModule,
  NgModuleRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'app-dynamic-template',
  template: `
    <h2>
      Stuff bellow will get dynamically created and injected
      <h2>
        <div #vc></div>
      </h2>
    </h2>
  `,
  styles: [],
})
export class DynamicTemplateComponent {
  @ViewChild('vc', { read: ViewContainerRef })
  vc!: ViewContainerRef;

  private cmpRef!: ComponentRef<any>;

  constructor(
    private compiler: Compiler,
    private injector: Injector,
    private moduleRef: NgModuleRef<any>
  ) {}

  ngAfterViewInit() {
    // Here, get your HTML from backend.
    this.createComponentFromRaw(
      '<div>Hello world: {{data.some}} {{getX()}} <div *ngFor="let i of [1,2,3,4,5]"><span (click)="clickMe(i)">{{i}}</span></div>'
    );
  }

  // Here we create the component.
  private createComponentFromRaw(template: string) {
    // Let's say your template looks like `<h2><some-component [data]="data"></some-component>`
    // As you see, it has an (existing) angular component `some-component` and it injects it [data]

    // Now we create a new component. It has that template, and we can even give it data.
    const styles: never[] = [];

    const TemplateConstructorFunction = function TmpCmpConstructor(
      this: any
    ): any {
      this.data = { some: 'data' };
      this.getX = () => 'X';

      this.clickMe = (i: any) => {
        alert(i);
      };
    };
    const tmpCmp: any = Component({ template, styles })(
      new (TemplateConstructorFunction as any)().constructor
    );

    // Now, also create a dynamic module.
    const tmpModule = NgModule({
      imports: [CommonModule],
      declarations: [tmpCmp, DynamicTemplateComponent],
      // providers: [] - e.g. if your dynamic component needs any service, provide it here.
    })(class {});

    // Now compile this module and component, and inject it into that #vc in your current component template.
    this.compiler
      .compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories: { componentFactories: any[] }) => {
        const f = factories.componentFactories[0];
        this.cmpRef = f.create(this.injector, [], null, this.moduleRef);
        this.cmpRef.instance.name = 'my-dynamic-component';
        this.vc.insert(this.cmpRef.hostView);
      });
  }

  // Cleanup properly. You can add more cleanup-related stuff here.
  ngOnDestroy() {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
  }
}
