---
layout: doc
prev: false
next: false
lastUpdated: false
---

欢迎来到 rbackly 的学习记事本&nbsp;<span :class="$style.motto"></span>

<style module>
  @keyframes blink {
    0% { opacity:1; }
    50% { opacity:0; }
    100% { opacity:1; }
  }

  @-webkit-keyframes blink {
    0% { opacity:1; }
    50% { opacity:0; }
    100% { opacity:1; }
  }

  @-moz-keyframes blink {
    0% { opacity:1; }
    50% { opacity:0; }
    100% { opacity:1; }
  }

  .motto {
    display: inline-block;
    height: 1px;
    width: 9px;
    border-bottom: 1px solid;
    opacity: 1;

    animation: blink 0.9s infinite;
  }
</style>
