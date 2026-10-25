import { createApp } from './app';
import { startScheduler } from './modules/reminders/reminder.scheduler';

const port = Number(process.env.PORT ?? 5000);

createApp().listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  startScheduler();
});
