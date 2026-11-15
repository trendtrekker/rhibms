// RHIBMS Admissions Admin Controller
(function() {
  const token = localStorage.getItem('rhibms_admin_token');
  if (!token) {
    window.location.replace('/admin/login');
    return;
  }

  let currentStatus = 'all';
  let currentCategory = 'all';
  let searchQuery = '';
  let activeAdmissions = [];
  let selectedAdmission = null;
  const pageSize = 50;
  let offset = 0;
  let latestRequest = 0;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  async function adminFetch(url, options = {}) {
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) logoutAdmin();
    return response;
  }

  function refreshAdmissions() {
    offset = 0;
    return fetchAdmissionsData();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    fetchStats();
    fetchAdmissionsData();
  });

  function initEvents() {
    // Status Tabs
    document.querySelectorAll('.status-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.status-tab').forEach(t => {
          t.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow-md');
          t.classList.add('bg-slate-800', 'text-slate-400');
        });
        tab.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow-md');
        tab.classList.remove('bg-slate-800', 'text-slate-400');

        currentStatus = tab.getAttribute('data-status');
        refreshAdmissions();
      });
    });

    document.getElementById('previous-page').addEventListener('click', () => {
      offset = Math.max(0, offset - pageSize);
      fetchAdmissionsData();
    });
    document.getElementById('next-page').addEventListener('click', () => {
      offset += pageSize;
      fetchAdmissionsData();
    });

    // Search Input with Debounce
    const searchInput = document.getElementById('admin-search-input');
    let searchTimeout = null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          searchQuery = e.target.value.trim();
          refreshAdmissions();
        }, 300);
      });
    }
  }

  // Fetch KPI Stats
  async function fetchStats() {
    try {
      const res = await adminFetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('Stats unavailable');
      document.getElementById('db-status-text').textContent = 'Neon registry connected';
      if (data.stats) {
        const s = data.stats;
        document.getElementById('stat-total').textContent = (s.total || 0).toLocaleString();
        document.getElementById('stat-pending').textContent = (s.pending || 0).toLocaleString();
        document.getElementById('stat-review').textContent = (s.under_review || 0).toLocaleString();
        document.getElementById('stat-accepted').textContent = (s.accepted || 0).toLocaleString();
        document.getElementById('stat-tuition').textContent = (s.totalTuition || 0).toLocaleString() + ' F';

        document.getElementById('count-tab-all').textContent = s.total || 0;
        document.getElementById('count-tab-pending').textContent = s.pending || 0;
        document.getElementById('count-tab-review').textContent = s.under_review || 0;
        document.getElementById('count-tab-accepted').textContent = s.accepted || 0;
      }
    } catch (e) {
      document.getElementById('db-status-text').textContent = 'Registry unavailable';
    }
  }

  // Fetch Admissions Data
  async function fetchAdmissionsData() {
    const request = ++latestRequest;
    const previous = document.getElementById('previous-page');
    const next = document.getElementById('next-page');
    const pageLabel = document.getElementById('page-label');
    previous.disabled = true;
    next.disabled = true;
    pageLabel.textContent = '';
    const tableBody = document.getElementById('admissions-table-body');
    const emptyNotice = document.getElementById('table-empty-notice');
    const facultySelect = document.getElementById('faculty-filter');
    currentCategory = facultySelect?.value || 'all';

    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-10 text-slate-400">
          <span class="inline-block animate-spin mr-2">⏳</span> Querying Neon Database...
        </td>
      </tr>
    `;
    emptyNotice?.classList.add('hidden');

    try {
      const queryParams = new URLSearchParams({
        status: currentStatus,
        category: currentCategory,
        search: searchQuery, limit: pageSize, offset
      });

      const res = await adminFetch(`/api/admin/admissions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (request !== latestRequest) return;
      if (!res.ok || !data.success || !Array.isArray(data.admissions)) throw new Error('Registry unavailable');
      if (offset && offset >= data.total) {
        offset = data.total ? Math.floor((data.total - 1) / pageSize) * pageSize : 0;
        return fetchAdmissionsData();
      }
      activeAdmissions = data.admissions;
      renderAdmissionsTable(activeAdmissions);
      previous.disabled = offset === 0;
      next.disabled = offset + pageSize >= data.total;
      pageLabel.textContent = data.total ? `${offset + 1}–${offset + activeAdmissions.length} of ${data.total}` : '0 applications';
    } catch {
      if (request !== latestRequest) return;
      activeAdmissions = [];
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-rose-400" role="alert">Could not load the admissions registry. Use Refresh to retry.</td></tr>';
    }
  }

  function getStatusBadge(status) {
    const badges = {
      'pending': '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">Pending</span>',
      'under_review': '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">Under Review</span>',
      'accepted': '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Accepted</span>',
      'rejected': '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">Rejected</span>',
      'enrolled': '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">Enrolled</span>'
    };
    return badges[status] || `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400">${escapeHtml(status || 'Pending')}</span>`;
  }

  function renderAdmissionsTable(items) {
    const tableBody = document.getElementById('admissions-table-body');
    const emptyNotice = document.getElementById('table-empty-notice');

    if (items.length === 0) {
      tableBody.innerHTML = '';
      emptyNotice?.classList.remove('hidden');
      return;
    }

    emptyNotice?.classList.add('hidden');
    tableBody.innerHTML = items.map(item => {
      const dateFormatted = new Date(item.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">${escapeHtml(item.reference_no)}</td>
          <td class="py-3.5 px-4 font-bold text-white">${escapeHtml(item.full_name)}<br><span class="text-[10px] text-slate-500 font-normal">${escapeHtml(item.city || 'Cameroon')}</span></td>
          <td class="py-3.5 px-4"><span class="font-medium text-slate-200">${escapeHtml(item.program)}</span><br><span class="text-[10px] text-slate-500 uppercase font-semibold">${escapeHtml(item.school_category || 'Faculty')}</span></td>
          <td class="py-3.5 px-4 text-slate-300 font-mono text-[11px]">${escapeHtml(item.phone)}<br><span class="text-slate-500 text-[10px]">${escapeHtml(item.email)}</span></td>
          <td class="py-3.5 px-4 text-slate-300">${escapeHtml(item.qualification)}</td>
          <td class="py-3.5 px-4 text-slate-400">${dateFormatted}</td>
          <td class="py-3.5 px-4">${getStatusBadge(item.status)}</td>
          <td class="py-3.5 px-4 text-right">
            <button onclick="openDetailModal(${Number(item.id)})" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm">
              Manage
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Open Detail Drawer Modal
  window.openDetailModal = function(id) {
    selectedAdmission = activeAdmissions.find(a => Number(a.id) === id);
    if (!selectedAdmission) return;

    document.getElementById('modal-ref-badge').textContent = selectedAdmission.reference_no;
    document.getElementById('modal-fullname').textContent = selectedAdmission.full_name;
    document.getElementById('modal-phone').textContent = selectedAdmission.phone;
    document.getElementById('modal-email').textContent = selectedAdmission.email;
    document.getElementById('modal-city').textContent = selectedAdmission.city || 'Cameroon';
    document.getElementById('modal-qualification').textContent = selectedAdmission.qualification;
    document.getElementById('modal-school').textContent = selectedAdmission.school_attended || 'Not specified';
    document.getElementById('modal-year').textContent = selectedAdmission.graduation_year || 'Not specified';
    document.getElementById('modal-program').textContent = selectedAdmission.program;
    document.getElementById('modal-session').textContent = `${selectedAdmission.intake_session} • Campus Hostel: ${selectedAdmission.hostel_needed ? 'Yes' : 'No'}`;

    document.getElementById('modal-status-select').value = selectedAdmission.status || 'pending';
    document.getElementById('modal-tuition-select').value = selectedAdmission.tuition_status || 'unpaid';
    document.getElementById('modal-tuition-amount').value = selectedAdmission.tuition_amount_paid || 0;
    document.getElementById('modal-notes').value = selectedAdmission.admin_notes || '';

    // WhatsApp Action Link
    const cleanPhone = (selectedAdmission.phone || '').replace(/\D/g, '');
    const candidateName = selectedAdmission.full_name;
    const ref = selectedAdmission.reference_no;
    const msg = encodeURIComponent(`Hello ${candidateName}, this is the Admissions Registry at RHIBMS Buea regarding your application (${ref}). We are pleased to review your file for the 2026/2027 Academic Session.`);
    document.getElementById('modal-whatsapp-btn').onclick = () => {
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    };

    document.getElementById('print-admission-letter').disabled = !['accepted', 'enrolled'].includes(selectedAdmission.status);
    document.getElementById('detail-modal').classList.remove('hidden');
  };

  window.closeDetailModal = function() {
    document.getElementById('detail-modal').classList.add('hidden');
  };

  // Save Admission Changes to Neon DB
  window.saveAdmissionChanges = async function() {
    if (!selectedAdmission) return;
    const saveBtn = document.getElementById('modal-save-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Saving to Neon...';

    const newStatus = document.getElementById('modal-status-select').value;
    const newTuitionStatus = document.getElementById('modal-tuition-select').value;
    const newTuitionPaid = document.getElementById('modal-tuition-amount').value;
    const newNotes = document.getElementById('modal-notes').value;

    try {
      const res = await adminFetch('/api/admin/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedAdmission.id,
          status: newStatus,
          tuitionStatus: newTuitionStatus,
          tuitionAmountPaid: newTuitionPaid,
          adminNotes: newNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        selectedAdmission.status = newStatus;
        selectedAdmission.tuition_status = newTuitionStatus;
        selectedAdmission.tuition_amount_paid = newTuitionPaid;
        selectedAdmission.admin_notes = newNotes;
        closeDetailModal();
        fetchStats();
        fetchAdmissionsData();
      } else {
        alert(data.error || 'Failed to update database.');
      }
    } catch (err) {
      alert('The changes could not be confirmed. Refresh the registry before retrying.');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>Save Changes to Neon DB</span>';
    }
  };

  // Export Registry CSV
  window.exportRegistryCsv = async function() {
    try {
      const response = await adminFetch('/api/admin/export');
      if (!response.ok) throw new Error('Export failed');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rhibms-admissions.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      alert('Could not export the admissions registry.');
    }
  };

  // Print Official Admission Letter
  window.printOfficialAdmissionLetter = function() {
    if (!selectedAdmission || !['accepted', 'enrolled'].includes(selectedAdmission.status)) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Letter - ${escapeHtml(selectedAdmission.reference_no)}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #064e3b; padding-bottom: 15px; margin-bottom: 30px; }
          .logo { height: 70px; }
          .ref { font-family: monospace; font-weight: bold; background: #eee; padding: 3px 8px; }
          .badge { text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #064e3b; font-weight: bold; }
          .footer { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 15px; font-size: 12px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <img class="logo" src="/assets/images/branding/rhibms-crest.png" alt="RHIBMS crest">
          <h2>REDEMPTION HIGHER INSTITUTE OF BIOMEDICAL AND MANAGEMENT SCIENCES (RHIBMS)</h2>
          <p class="badge">Approved by Cameroon Ministry of Public Health &bull; Ministry of Higher Education</p>
          <p>Molyko, Buea, Southwest Region, Cameroon | info@rhibms.com | (+237) 677 172 022</p>
        </div>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
        <p><strong>Application Ref:</strong> <span class="ref">${escapeHtml(selectedAdmission.reference_no)}</span></p>
        <p><strong>To:</strong> ${escapeHtml(selectedAdmission.full_name)}<br><strong>Contact:</strong> ${escapeHtml(selectedAdmission.phone)}</p>
        <h3>OFFICIAL PROVISIONAL ADMISSION NOTIFICATION (2026/2027)</h3>
        <p>Dear <strong>${escapeHtml(selectedAdmission.full_name)}</strong>,</p>
        <p>We are pleased to inform you that upon review of your academic qualifications (${escapeHtml(selectedAdmission.qualification)}), the Admissions Committee of RHIBMS has offered you admission into the following accredited program:</p>
        <p style="padding: 10px; background: #f0fdf4; border-left: 4px solid #064e3b;"><strong>Program:</strong> ${escapeHtml(selectedAdmission.program)}<br><strong>Session:</strong> ${escapeHtml(selectedAdmission.intake_session)}</p>
        <p>Please present this document to the Bursary &amp; Registry Office at our Buea Campus (Tarred Malingo, Opposite Pres Hostel) to finalize registration formalities and secure your enrollment slot.</p>
        <br><br>
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div>____________________________<br><strong>Registrar of Admissions</strong><br>RHIBMS Buea Campus</div>
          <div>____________________________<br><strong>Academic Dean</strong><br>RHIBMS University</div>
        </div>
        <div class="footer">
          Redemption Higher Institute &bull; Shaping Cameroon's Healthcare &amp; Vocational Future Since 2010
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  // Log Out
  window.logoutAdmin = function() {
    localStorage.removeItem('rhibms_admin_token');
    localStorage.removeItem('rhibms_admin_user');
    window.location.replace('/admin/login');
  };

  window.fetchAdmissionsData = refreshAdmissions;
})();
