import cron from 'node-cron';

const scheduleTask = () => {
  // setiap menit
  cron.schedule('* * * * *', () => {
    console.log(`[INFO] run task every minutes ${new Date().toLocaleString()}`);
  });

  // setiap jam
  cron.schedule('0 * * * *', () => {
    console.log(`[INFO] run task every hours ${new Date().toLocaleString()}`);
  });

  // setiap jam 11:00
  cron.schedule('0 11 * * *', () => {
    console.log(`[INFO] run task every 11:00 ${new Date().toLocaleString()}`);
  });

  // setiap 5 menit
  cron.schedule('*/5 * * * *', () => {
    console.log(`[INFO] run task every 5 minutes ${new Date().toLocaleString()}`);
  });

  // setiap senin,rabu jam 8:00
  cron.schedule('0 8 * * 1,3', () => {
    console.log(`[INFO] run task every monday and wednesday ${new Date().toLocaleString()}`);
  });
};

export default scheduleTask;
