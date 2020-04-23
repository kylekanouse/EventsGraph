<head>
    <script src="//unpkg.com/3d-force-graph-vr@1"></script>
    <script src="//unpkg.com/d3-dsv"></script>
    <script src="//unpkg.com/three-spritetext"></script>

    <script src="lib/utils.class.js"></script>
    <script src="lib/events-graph-node.class.js"></script>
    <script src="lib/events-graph-link.class.js"></script>
    <script src="lib/events-graph-user.class.js"></script>
    <script src="lib/events-graph.class.js"></script>
    <script src="lib/events-graph.activities.mock.js"></script>

    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="graph-data">
        <span id="graph-data-description"></span>
    </div>
    <div id="3d-graph"></div>
    <div class="control-btn-container">
      <button id="add-user-btn">Remove user</button>
    </div>

    <script src="index.js"></script>
</body>