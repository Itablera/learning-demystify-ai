import { Health, HealthRepository } from "@workspace/domains";

export class MockHealthRepository implements HealthRepository {
  private health: Health = {
    status: "ok",
  };

  constructor() {}

  async status(): Promise<Health> {
    return this.health;
  }

  async setStatus(status: Health): Promise<void> {
    this.health = status;
  }
}