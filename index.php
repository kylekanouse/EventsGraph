<head>
    <!-- 3D Force Graph Buisness -->
    <script src="//unpkg.com/three"></script>
    <script src="//unpkg.com/3d-force-graph-vr@1"></script>
    <script src="//unpkg.com/d3-dsv"></script>
    <script src="//unpkg.com/three-spritetext"></script>

    <!-- dat GUI -->
    <script type="text/javascript" src="./assets/js/datguivr.js"></script>

    <!-- general -->
    <link rel="stylesheet" href="./assets/css/style.css" />
</head>

<body>
  <!-- Overlay modal -->
  <div id="overlay-wrapper">
    <div class="overlay"></div>
    <div class="modal">
      <button id="startBtn">Click to load graph</button>
    </div>
  </div>

  <!-- Graph display -->
  <div class="graph-data">
      <span id="graph-data-description"></span>
      <div id="graph-data-monitor" class="ui-window-container"></div>
  </div>
  <div id="3d-graph"></div>

  <!-- HUD Display -->
  <div id="hud">
    <!-- Controls -->
    <div class="control-btn-container">
      <div class="control-item">
        <div class="column">
          <span class="label">Events:</span>
        </div>
        <div class="column">
          <button id="add-event-btn">+</button>
        </div>  
        <!-- <button id="remove-eve-btn">-</button> -->
      </div>
      <div class="control-item">
        <div class="column">
          <span class="label">Users:</span>
        </div>
        <div class="column">
          <button id="add-user-btn">+</button>
          <button id="remove-user-btn">-</button>
        </div>
      </div>
    </div>
    <div class="monitor-window"></div>
  </div>

  <!-- Load main app JS -->
  <script type="module" src="main.mjs"></script>

</body>