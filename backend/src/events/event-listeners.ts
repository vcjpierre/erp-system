import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppEvent } from './event-bus';

@Injectable()
export class EventListeners {
  private readonly logger = new Logger(EventListeners.name);

  @OnEvent('user.login')
  handleUserLogin(event: AppEvent) {
    this.logger.log(`User ${event.userId} logged in from ${event.data.ipAddress}`);
  }

  @OnEvent('user.logout')
  handleUserLogout(event: AppEvent) {
    this.logger.log(`User ${event.userId} logged out`);
  }

  @OnEvent('user.created')
  handleUserCreated(event: AppEvent) {
    this.logger.log(`User created: ${event.data.email}`);
  }

  @OnEvent('company.created')
  handleCompanyCreated(event: AppEvent) {
    this.logger.log(`Company created: ${event.data.legalName}`);
  }

  @OnEvent('security.suspicious')
  handleSuspiciousActivity(event: AppEvent) {
    this.logger.warn(`Suspicious activity detected: ${JSON.stringify(event.data)}`);
  }
}
