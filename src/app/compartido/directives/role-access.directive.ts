import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../funcionalidades/auth/auth.service';

/**
 * Directiva estructural para mostrar/ocultar elementos según roles de usuario
 * Uso: <div *appRoleAccess="['admin', 'mesero']">Contenido solo para admin y mesero</div>
 */
@Directive({
  selector: '[appRoleAccess]',
  standalone: true
})
export class RoleAccessDirective implements OnInit {
  @Input() appRoleAccess: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkAccess();
  }

  private checkAccess() {
    const currentUser = this.authService.usuario;
    
    if (!currentUser) {
      this.viewContainer.clear();
      return;
    }

    const hasAccess = this.appRoleAccess.length === 0 || 
                     this.appRoleAccess.includes(currentUser.rol);

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
