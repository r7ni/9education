// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Apply dark mode if saved in localStorage
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
  }

  // Function to update the toggle button text based on the current mode
  const toggleButton = document.getElementById('toggle-mode');
  function updateToggleText() {
    if (document.documentElement.classList.contains('dark')) {
      toggleButton.textContent = 'Switch to Light Mode';
    } else {
      toggleButton.textContent = 'Switch to Dark Mode';
    }
  }
  updateToggleText();

  // Toggle dark mode and update text
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'disabled');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
      }
      updateToggleText();
    });
  }

  // Update sidebar auth link and "My Courses" link based on authentication state.
  fetch('/profile-data')
    .then(response => {
      const authLink = document.getElementById('auth-link');
      const myCoursesLi = document.getElementById('my-courses-li');
      if (response.ok) {
        window.isLoggedIn = true;
        if (authLink) {
          authLink.textContent = 'Profile';
          authLink.href = '/profile';
          authLink.style.visibility = 'visible';
        }
        if (myCoursesLi) {
          myCoursesLi.style.display = 'block';
        }
      } else {
        window.isLoggedIn = false;
        if (authLink) {
          authLink.textContent = 'Log In - Sign Up';
          authLink.href = '/login';
          authLink.style.visibility = 'visible';
        }
        if (myCoursesLi) {
          myCoursesLi.style.display = 'none';
        }
      }
    })
    .catch(error => {
      console.error('Error checking auth state:', error);
      const authLink = document.getElementById('auth-link');
      const myCoursesLi = document.getElementById('my-courses-li');
      window.isLoggedIn = false;
      if (authLink) {
        authLink.textContent = 'Log In - Sign Up';
        authLink.href = '/login';
        authLink.style.visibility = 'visible';
      }
      if (myCoursesLi) {
        myCoursesLi.style.display = 'none';
      }
    });
  
  // Override toggleCourse if it exists to block registration when not logged in.
  if (typeof toggleCourse === 'function') {
    const originalToggleCourse = toggleCourse;
    toggleCourse = function(courseName) {
      if (!window.isLoggedIn) {
        alert("Please log in to register for courses.");
        return;
      }
      originalToggleCourse(courseName);
    }
  }
});
