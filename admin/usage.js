window.auraUsage = {
 remaining(expiry) {
  if (!expiry) return 'Müddətsiz';
  const milliseconds = Date.parse(expiry) - Date.now();
  if (!Number.isFinite(milliseconds)) return '—';
  if (milliseconds <= 0) return 'Vaxt bitib';
  const hours = Math.ceil(milliseconds / 3600000);
  if (hours < 24) return hours + ' saat';
  const days = Math.floor(hours / 24), rest = hours % 24;
  return days + ' gün' + (rest ? ' ' + rest + ' saat' : '');
 },
 generations(stats) {
  if (!stats) return '—';
  const total = Number(stats.completed || 0).toLocaleString('az-AZ');
  return stats.generation_limit == null
   ? total + ' tamamlanıb'
   : total + ' tamamlanıb · ' + stats.quota_used + ' / ' + stats.generation_limit + ' limit';
 }
};

(() => {
 if (document.body.dataset.mode === 'admin') return;
 const account = document.querySelector('#accountPlan');
 if (!account) return;
 const details = document.createElement('dl');
 details.className = 'aura-account-usage';
 details.innerHTML = '<dt>Qalan vaxt</dt><dd data-time></dd><dt>Generasiyalar</dt><dd data-generations></dd>';
 account.after(details);
 function update(state) {
  const license = state?.license;
  details.hidden = !license;
  if (!license) return;
  details.querySelector('[data-time]').textContent = auraUsage.remaining(license.license_expires_at);
  details.querySelector('[data-generations]').textContent = auraUsage.generations(license.usage);
 }
 window.addEventListener('aura-auth', event => update(event.detail));
 update(window.auraAuthState);
})();
