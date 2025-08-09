// Visual Integration Test - Ensures all components follow design system
// This file contains utilities to verify visual consistency

export const designSystemTests = {
  // Test color consistency
  testColorPalette: () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const colors = {
      primary: computedStyle.getPropertyValue('--primary-color').trim(),
      primaryHover: computedStyle.getPropertyValue('--primary-hover').trim(),
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
      glassBg: computedStyle.getPropertyValue('--glass-bg').trim(),
    };
    
    console.log('🎨 Color Palette Test:', colors);
    return colors;
  },

  // Test typography consistency
  testTypography: () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const typography = {
      fontPrimary: computedStyle.getPropertyValue('--font-primary').trim(),
      fontSizeBase: computedStyle.getPropertyValue('--font-size-base').trim(),
      fontWeightMedium: computedStyle.getPropertyValue('--font-weight-medium').trim(),
      lineHeightNormal: computedStyle.getPropertyValue('--line-height-normal').trim(),
    };
    
    console.log('📝 Typography Test:', typography);
    return typography;
  },

  // Test spacing consistency
  testSpacing: () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const spacing = {
      space2: computedStyle.getPropertyValue('--space-2').trim(),
      space4: computedStyle.getPropertyValue('--space-4').trim(),
      space6: computedStyle.getPropertyValue('--space-6').trim(),
      space8: computedStyle.getPropertyValue('--space-8').trim(),
    };
    
    console.log('📏 Spacing Test:', spacing);
    return spacing;
  },

  // Test shadow consistency
  testShadows: () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const shadows = {
      shadowMd: computedStyle.getPropertyValue('--shadow-md').trim(),
      shadowLg: computedStyle.getPropertyValue('--shadow-lg').trim(),
      shadowPrimary: computedStyle.getPropertyValue('--shadow-primary').trim(),
    };
    
    console.log('🌟 Shadow Test:', shadows);
    return shadows;
  },

  // Test transition consistency
  testTransitions: () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const transitions = {
      transitionNormal: computedStyle.getPropertyValue('--transition-normal').trim(),
      transitionFast: computedStyle.getPropertyValue('--transition-fast').trim(),
      transitionSlow: computedStyle.getPropertyValue('--transition-slow').trim(),
    };
    
    console.log('⚡ Transition Test:', transitions);
    return transitions;
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Running Visual Integration Tests...');
    
    const results = {
      colors: designSystemTests.testColorPalette(),
      typography: designSystemTests.testTypography(),
      spacing: designSystemTests.testSpacing(),
      shadows: designSystemTests.testShadows(),
      transitions: designSystemTests.testTransitions(),
    };
    
    console.log('✅ All Visual Integration Tests Complete');
    return results;
  },

  // Test interactive elements
  testInteractiveElements: () => {
    const buttons = document.querySelectorAll('button');
    const inputs = document.querySelectorAll('input, textarea');
    const clickableElements = document.querySelectorAll('[role="button"], .chat-item');
    
    console.log('🖱️ Interactive Elements Test:', {
      buttons: buttons.length,
      inputs: inputs.length,
      clickableElements: clickableElements.length,
    });
    
    // Test focus states
    buttons.forEach((button, index) => {
      if (index < 3) { // Test first 3 buttons only
        button.focus();
        setTimeout(() => button.blur(), 100);
      }
    });
    
    return {
      buttonsCount: buttons.length,
      inputsCount: inputs.length,
      clickableCount: clickableElements.length,
    };
  },

  // Test animations
  testAnimations: () => {
    const animatedElements = document.querySelectorAll('[class*="animate-"], .message, .chat-item');
    
    console.log('🎬 Animation Test:', {
      animatedElements: animatedElements.length,
    });
    
    return {
      animatedElementsCount: animatedElements.length,
    };
  }
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => designSystemTests.runAllTests(), 1000);
    });
  } else {
    setTimeout(() => designSystemTests.runAllTests(), 1000);
  }
}

export default designSystemTests;