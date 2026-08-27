import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="auth">
      <div class="auth-aside">
        <div class="aside-inner">
          <a class="brand" routerLink="/auth/login">
            <span class="brand-mark">₿</span>
            <span class="brand-name">Finance<b>Manager</b></span>
          </a>
          <h2>Take control of your money.</h2>
          <p>
            Track income, manage expenses, set budgets and visualize your
            financial health — all in one elegant dashboard.
          </p>
          <ul class="aside-points">
            <li>📊 Clear dashboards &amp; insights</li>
            <li>🧾 Smart transaction tracking</li>
            <li>🧩 Budgets with live warnings</li>
            <li>📈 Beautiful visual reports</li>
          </ul>
          <div class="aside-float float-1">💰</div>
          <div class="aside-float float-2">📈</div>
        </div>
      </div>

      <div class="auth-main">
        <div class="auth-card">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      .auth-aside {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #9333ea 100%);
        color: #fff;
        padding: 48px;
        position: relative;
        overflow: hidden;
      }
      .aside-inner { max-width: 380px; margin: auto; position: relative; z-index: 2; }
      .brand { display: flex; align-items: center; gap: 12px; color: #fff; }
      .brand-mark {
        width: 38px; height: 38px; border-radius: 11px;
        background: rgba(255,255,255,0.18); display: grid; place-items: center;
        font-size: 20px; font-weight: 700;
      }
      .brand-name { font-size: 18px; font-weight: 600; }
      .brand-name b { font-weight: 800; }
      .auth-aside h2 { font-size: 30px; margin: 36px 0 14px; color: #fff; line-height: 1.2; }
      .auth-aside p { color: rgba(255,255,255,0.82); font-size: 15px; }
      .aside-points { margin-top: 26px; display: grid; gap: 12px; }
      .aside-points li {
        background: rgba(255,255,255,0.12);
        padding: 12px 16px; border-radius: 12px; font-size: 14px;
      }
      .aside-float {
        position: absolute; font-size: 90px; opacity: 0.12;
      }
      .float-1 { bottom: -10px; right: 20px; }
      .float-2 { top: 30px; right: 40px; font-size: 60px; }

      .auth-main {
        display: grid; place-items: center; padding: 32px;
        background: var(--bg);
      }
      .auth-card { width: 100%; max-width: 400px; }

      @media (max-width: 900px) {
        .auth { grid-template-columns: 1fr; }
        .auth-aside { display: none; }
      }
    `,
  ],
})
export class AuthLayoutComponent {}
