<head>
    <!-- 3D Force Graph Buisness -->
    <script src="//unpkg.com/three"></script>
    <script src="//unpkg.com/3d-force-graph-vr@1"></script>
    <script src="//unpkg.com/d3-dsv"></script>
    <script src="//unpkg.com/three-spritetext"></script>

    <!-- general -->
    <link rel="stylesheet" href="./assets/css/style.css" />
</head>

<body>
  <div id="app"></div>
  <div class="graph-data">
      <span id="graph-data-description"></span>
  </div>
  <div id="3d-graph"></div>
  <div class="control-btn-container">
    <button id="add-user-btn">+</button>
    <button id="remove-user-btn">-</button>
  </div>

  <!-- Load main app -->
  <script type="module" src="main.mjs"></script>

</body>