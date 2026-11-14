// RHIBMS Admissions Admin Controller
(function() {
  const token = localStorage.getItem('rhibms_admin_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  let currentStatus = 'all';
  let currentCategory = 'all';
  let searchQuery = '';
  let activeAdmissions = [];
  let selectedAdmission = null;

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
        fetchAdmissionsData();
      });
    });

    // Search Input with Debounce
    const searchInput = document.getElementById('admin-search-input');
    let searchTimeout = null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          searchQuery = e.target.value.trim();
          fetchAdmissionsData();
        }, 300);
      });
    }
  }

  // Fetch KPI Stats
  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.stats) {
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
      console.warn('Could not fetch remote stats:', e);
    }
  }

  // Fetch Admissions Data
  async function fetchAdmissionsData() {
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
        search: searchQuery
      });

      const res = await fetch(`/api/admin/admissions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.admissions)) {
        activeAdmissions = data.admissions;
        renderAdmissionsTable(activeAdmissions);
      } else {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-rose-400 font-medium">Failed to retrieve data. Set DATABASE_URL.</td></tr>`;
      }
    } catch (err) {
      console.warn('API Error, using local fallback:', err);
      // Fallback sample data to test UI preview
      renderFallbackDemoData();
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
    return badges[status] || `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400">${status || 'Pending'}</span>`;
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
          <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">${item.reference_no}</td>
          <td class="py-3.5 px-4 font-bold text-white">${item.full_name}<br><span class="text-[10px] text-slate-500 font-normal">${item.city || 'Cameroon'}</span></td>
          <td class="py-3.5 px-4"><span class="font-medium text-slate-200">${item.program}</span><br><span class="text-[10px] text-slate-500 uppercase font-semibold">${item.school_category || 'Faculty'}</span></td>
          <td class="py-3.5 px-4 text-slate-300 font-mono text-[11px]">${item.phone}<br><span class="text-slate-500 text-[10px]">${item.email}</span></td>
          <td class="py-3.5 px-4 text-slate-300">${item.qualification}</td>
          <td class="py-3.5 px-4 text-slate-400">${dateFormatted}</td>
          <td class="py-3.5 px-4">${getStatusBadge(item.status)}</td>
          <td class="py-3.5 px-4 text-right">
            <button onclick="openDetailModal(${item.id})" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm">
              Manage
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderFallbackDemoData() {
    activeAdmissions = [
      {
        id: 1,
        reference_no: 'RHIBMS-2026-891042',
        full_name: 'Bate Sarah Enow',
        phone: '(+237) 677 123 456',
        email: 'sarah.bate@gmail.com',
        city: 'Buea, Cameroon',
        qualification: 'GCE Advanced Level',
        graduation_year: 2024,
        school_attended: 'Bilingual Grammar School Molyko',
        program: 'HND Nursing / State Registered Nursing (SRN)',
        school_category: 'health',
        intake_session: 'October 2026/2027 Main Intake',
        hostel_needed: false,
        status: 'pending',
        admin_notes: 'Transcripts in Biology and Chemistry submitted.',
        tuition_status: 'unpaid',
        tuition_amount_paid: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        reference_no: 'RHIBMS-2026-443210',
        full_name: 'Tanyi Junior Besong',
        phone: '(+237) 654 987 321',
        email: 'tanyi.junior@yahoo.com',
        city: 'Limbe, Cameroon',
        qualification: 'Baccalauréat Series D',
        graduation_year: 2023,
        school_attended: 'Lycee Classique de Limbe',
        program: 'HND in Medical Laboratory Science',
        school_category: 'health',
        intake_session: 'October 2026/2027 Main Intake',
        hostel_needed: true,
        status: 'accepted',
        admin_notes: 'Orientation interview completed successfully. Acceptance granted.',
        tuition_status: 'partially_paid',
        tuition_amount_paid: 100000,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    renderAdmissionsTable(activeAdmissions);
  }

  // Open Detail Drawer Modal
  window.openDetailModal = function(id) {
    selectedAdmission = activeAdmissions.find(a => a.id === id);
    if (!selectedAdmission) return;

    document.getElementById('modal-ref-badge').textContent = selectedAdmission.reference_no;
    document.getElementById('modal-fullname').textContent = selectedAdmission.full_name;
    document.getElementById('modal-phone').textContent = selectedAdmission.phone;
    document.getElementById('modal-email').textContent = selectedAdmission.email;
    document.getElementById('modal-city').textContent = selectedAdmission.city || 'Cameroon';
    document.getElementById('modal-qualification').textContent = selectedAdmission.qualification;
    document.getElementById('modal-school').textContent = selectedAdmission.school_attended || 'Not specified';
    document.getElementById('modal-year').textContent = selectedAdmission.graduation_year || '2024';
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
      const res = await fetch('/api/admin/status', {
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
      // Local preview fallback
      selectedAdmission.status = newStatus;
      closeDetailModal();
      fetchAdmissionsData();
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>Save Changes to Neon DB</span>';
    }
  };

  // Export Registry CSV
  window.exportRegistryCsv = function() {
    window.open(`/api/admin/export?token=${token}`, '_blank');
  };

  // Run Neon DB Initialization
  window.initDatabaseTables = async function() {
    const btn = document.getElementById('db-init-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin mr-1">⏳</span> Syncing...';

    try {
      const res = await fetch('/api/db/init');
      const data = await res.json();
      if (data.success) {
        alert('Neon Database tables verified and initialized successfully!');
        fetchStats();
        fetchAdmissionsData();
      } else {
        alert(data.error || 'Database initialization error. Check DATABASE_URL in Vercel.');
      }
    } catch (err) {
      alert('Could not reach /api/db/init. Make sure DATABASE_URL is configured.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Sync Neon DB</span>';
    }
  };

  // Print Official Admission Letter
  window.printOfficialAdmissionLetter = function() {
    if (!selectedAdmission) return;
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Letter - ${selectedAdmission.reference_no}</title>
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
          <h2>REDEMPTION HIGHER INSTITUTE OF BIOMEDICAL AND MANAGEMENT SCIENCES (RHIBMS)</h2>
          <p class="badge">Approved by Cameroon Ministry of Public Health &bull; Ministry of Higher Education</p>
          <p>Molyko, Buea, Southwest Region, Cameroon | info@rhibms.com | (+237) 677 172 022</p>
        </div>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
        <p><strong>Application Ref:</strong> <span class="ref">${selectedAdmission.reference_no}</span></p>
        <p><strong>To:</strong> ${selectedAdmission.full_name}<br><strong>Contact:</strong> ${selectedAdmission.phone}</p>
        <h3>OFFICIAL PROVISIONAL ADMISSION NOTIFICATION (2026/2027)</h3>
        <p>Dear <strong>${selectedAdmission.full_name}</strong>,</p>
        <p>We are pleased to inform you that upon review of your academic qualifications (${selectedAdmission.qualification}), the Admissions Committee of RHIBMS has offered you admission into the following accredited program:</p>
        <p style="padding: 10px; background: #f0fdf4; border-left: 4px solid #064e3b;"><strong>Program:</strong> ${selectedAdmission.program}<br><strong>Session:</strong> ${selectedAdmission.intake_session}</p>
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
    window.location.href = 'login.html';
  };

  window.fetchAdmissionsData = fetchAdmissionsData;
})();
