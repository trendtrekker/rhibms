// RHIBMS Modern Interactive Scripts
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });

  // Sticky Navbar shadow on scroll
  const navbar = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 20) {
        navbar.classList.add('glass-nav-scrolled', 'shadow-md');
      } else {
        navbar.classList.remove('glass-nav-scrolled', 'shadow-md');
      }
    }
  });

  // Hero Slider logic
  const heroSlides = [
    {
      image: 'assets/images/hero/hero-nursing-editorial.jpg',
      tag: 'Accredited Healthcare Training in Cameroon',
      title: 'Shaping Cameroon’s Healthcare & Biomedical Leaders',
      desc: 'Nationally accredited professional training approved by Cameroon’s Ministry of Public Health and Ministry of Higher Education. 100% hands-on clinical mastery and international career pathways.',
      primaryBtn: 'Explore Programs',
      primaryLink: '#programs',
      secondaryBtn: 'Apply for 2026/2027',
      secondaryLink: '#apply'
    },
    {
      image: 'assets/images/hero/hero-research-editorial.jpg',
      tag: 'Cutting-Edge Practical Laboratories',
      title: 'Advanced Biomedical Sciences & Clinical Practice',
      desc: 'Master diagnostics, pharmacy technology, and nursing in ultra-modern simulation wards and laboratory environments under certified medical consultants.',
      primaryBtn: 'View Health Programs',
      primaryLink: '#programs',
      secondaryBtn: 'Campus Virtual Tour',
      secondaryLink: '#facilities'
    },
    {
      image: 'assets/images/hero/hero-campus-editorial.jpg',
      tag: 'Proven Career Placement',
      title: 'Over 3,000+ Certified Graduates in Top Hospitals & Firms',
      desc: 'With a 90%+ employment rate, RHIBMS equips every student with industry-relevant skills, ethical leadership, and graduate startup capital grants.',
      primaryBtn: 'Read Success Stories',
      primaryLink: '#news',
      secondaryBtn: 'Start Application',
      secondaryLink: '#apply'
    }
  ];

  let currentSlide = 0;
  const heroBg = document.getElementById('hero-bg');
  const heroTag = document.getElementById('hero-tag');
  const heroTitle = document.getElementById('hero-title');
  const heroDesc = document.getElementById('hero-desc');
  const heroDots = document.querySelectorAll('.hero-dot');

  function updateHeroSlide(index) {
    if (!heroBg || !heroTitle) return;
    currentSlide = index;
    const slide = heroSlides[currentSlide];

    heroBg.style.opacity = '0.3';
    setTimeout(() => {
      heroBg.style.backgroundImage = `url('${slide.image}')`;
      heroBg.style.opacity = '1';
    }, 250);

    if (heroTag) heroTag.textContent = slide.tag;
    heroTitle.innerHTML = slide.title;
    if (heroDesc) heroDesc.textContent = slide.desc;

    heroDots.forEach((dot, idx) => {
      if (idx === currentSlide) {
        dot.classList.add('bg-amber-400', 'w-8');
        dot.classList.remove('bg-white/50', 'w-3');
      } else {
        dot.classList.remove('bg-amber-400', 'w-8');
        dot.classList.add('bg-white/50', 'w-3');
      }
    });
  }

  if (heroDots.length > 0) {
    heroDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => updateHeroSlide(idx));
    });

    setInterval(() => {
      currentSlide = (currentSlide + 1) % heroSlides.length;
      updateHeroSlide(currentSlide);
    }, 7000);
  }

  // Stats Counter Animation
  const statNumbers = document.querySelectorAll('.counter-val');
  let statsCounted = false;

  function countUpStats() {
    if (statsCounted) return;
    const statsSection = document.getElementById('stats-section');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.9) {
      statsCounted = true;
      statNumbers.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1800;
        const step = target / (duration / 25);
        let current = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            counter.textContent = target.toLocaleString() + (counter.getAttribute('data-suffix') || '');
            clearInterval(timer);
          } else {
            counter.textContent = Math.floor(current).toLocaleString() + (counter.getAttribute('data-suffix') || '');
          }
        }, 25);
      });
    }
  }

  window.addEventListener('scroll', countUpStats);
  countUpStats(); // check on load

  // Program Filtering & Search
  const filterBtns = document.querySelectorAll('.filter-btn');
  // Lightbox Modal for Gallery
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  window.openLightbox = function(src, caption) {
    if (!lightboxModal) return;
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || 'RHIBMS Campus & Academic Life';
    lightboxModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  };

  window.closeLightbox = function() {
    if (!lightboxModal) return;
    lightboxModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  };

  // Admissions Application Multi-Step Form
  let currentAppStep = 1;
  const appForm = document.getElementById('admission-application-form');

  window.nextAppStep = function(step) {
    // Basic validation before next
    if (step === 2) {
      const name = document.getElementById('app-fullname')?.value.trim();
      const phone = document.getElementById('app-phone')?.value.trim();
      const email = document.getElementById('app-email')?.value.trim();
      if (!name || !phone || !email) {
        showToast('Please fill in your Full Name, Phone number and Email.', 'warning');
        return;
      }
    } else if (step === 3) {
      const qual = document.getElementById('app-qualification')?.value;
      if (!qual) {
        showToast('Please select your highest academic qualification.', 'warning');
        return;
      }
    }

    document.querySelectorAll('.app-step-pane').forEach(p => p.classList.add('hidden'));
    document.getElementById(`app-step-${step}`)?.classList.remove('hidden');

    // Update indicator dots
    document.querySelectorAll('.app-step-indicator').forEach((ind, idx) => {
      const stepNum = idx + 1;
      if (stepNum <= step) {
        ind.classList.add('bg-emerald-600', 'text-white');
        ind.classList.remove('bg-slate-200', 'text-slate-600');
      } else {
        ind.classList.remove('bg-emerald-600', 'text-white');
        ind.classList.add('bg-slate-200', 'text-slate-600');
      }
    });

    currentAppStep = step;
  };

  window.prevAppStep = function(step) {
    window.nextAppStep(step);
  };

  if (appForm) {
    appForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('app-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Submitting to Admissions Registry...';
      }

      const applicantName = document.getElementById('app-fullname')?.value || 'Prospective Student';
      const phone = document.getElementById('app-phone')?.value || '';
      const email = document.getElementById('app-email')?.value || '';
      const city = document.getElementById('app-city')?.value || '';
      const qualification = document.getElementById('app-qualification')?.value || 'GCE A-Level';
      const graduationYear = document.getElementById('app-year')?.value || '';
      const schoolAttended = document.getElementById('app-school')?.value || '';
      const prog = document.getElementById('app-program')?.value || '';
      const session = document.getElementById('app-session')?.value || 'October 2026/2027 Main Intake';
      const hostelNeeded = document.getElementById('app-hostel')?.value === 'yes';

      try {
        const response = await fetch('/api/admissions/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: applicantName,
            phone,
            email,
            city,
            qualification,
            graduationYear,
            schoolAttended,
            program: prog,
            session,
            hostelNeeded
          })
        });

        const result = await response.json();
        if (!response.ok || !result.success || !result.referenceNo) {
          throw new Error(result.error || 'The application could not be saved. Please try again.');
        }
        const refNo = result.referenceNo;

        // Hide form panes, show success voucher
        document.querySelectorAll('.app-step-pane').forEach(p => p.classList.add('hidden'));
        const successPane = document.getElementById('app-step-success');
        if (successPane) {
          successPane.classList.remove('hidden');
          document.getElementById('voucher-ref').textContent = refNo;
          document.getElementById('voucher-name').textContent = applicantName;
          document.getElementById('voucher-prog').textContent = prog;
          document.getElementById('voucher-date').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        showToast('Application registered successfully! Keep your reference voucher code.', 'success');
      } catch (err) {
        showToast(err.message || 'Unable to submit. Please try again.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application & Generate Slip';
        }
      }
    });
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-800 text-white border-l-4 border-amber-400',
      warning: 'bg-amber-600 text-white border-l-4 border-white',
      info: 'bg-slate-900 text-white border-l-4 border-emerald-400'
    };

    toast.className = `${bgColors[type] || bgColors.info} p-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium transition-all transform translate-y-4 opacity-0 pointer-events-auto max-w-md`;
    toast.innerHTML = `
      <div class="flex-1"></div>
      <button class="text-white/80 hover:text-white text-lg leading-none" onclick="this.parentElement.remove()">&times;</button>
    `;

    toast.firstElementChild.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  window.showToast = showToast;

  // FAQ Accordion
  window.toggleFaq = function(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    if (!answer) return;

    if (answer.classList.contains('hidden')) {
      answer.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
      answer.classList.add('hidden');
      if (icon) icon.style.transform = 'rotate(0deg)';
    }
  };

  // Contact Form Submission Handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending Message...';
      }
      setTimeout(() => {
        showToast('Thank you! Your inquiry has been sent to our Admissions Desk. We will call you back shortly.', 'success');
        contactForm.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Send Message';
        }
      }, 1000);
    });
  }

  window.printVoucher = function() {
    const success = document.getElementById('app-step-success');
    if (!success || success.classList.contains('hidden')) return;

    const slip = document.createElement('section');
    slip.className = 'admission-print-slip';
    for (const part of success.querySelectorAll('[data-print-slip]')) {
      const copy = part.cloneNode(true);
      copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      slip.append(copy);
    }

    document.body.append(slip);
    window.addEventListener('afterprint', () => slip.remove(), { once: true });
    window.print();
  };
});
