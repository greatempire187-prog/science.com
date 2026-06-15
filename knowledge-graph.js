class KnowledgeGraphManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.edges = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('buildGraphBtn').addEventListener('click', () => this.buildGraph());
        document.getElementById('exportGraphBtn').addEventListener('click', () => this.exportGraph());
    }

    initCanvas() {
        this.canvas = document.getElementById('knowledgeGraphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (this.canvas) {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.drawGraph();
        }
    }

    async buildGraph() {
        const query = document.getElementById('graphQuery').value.trim();
        
        showLoading();
        try {
            const graphData = await API.buildKnowledgeGraph(query || 'all');
            this.nodes = graphData.nodes || [];
            this.edges = graphData.edges || [];
            this.initCanvas();
            this.drawGraph();
            showToast('Knowledge graph built successfully', 'success');
        } catch (error) {
            console.error('Error building graph:', error);
            showToast('Failed to build knowledge graph', 'error');
        } finally {
            hideLoading();
        }
    }

    drawGraph() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.edges.forEach(edge => {
            const sourceNode = this.nodes.find(n => n.id === edge.source);
            const targetNode = this.nodes.find(n => n.id === edge.target);

            if (sourceNode && targetNode) {
                const sourceX = centerX + sourceNode.x;
                const sourceY = centerY + sourceNode.y;
                const targetX = centerX + targetNode.x;
                const targetY = centerY + targetNode.y;

                this.ctx.beginPath();
                this.ctx.moveTo(sourceX, sourceY);
                this.ctx.lineTo(targetX, targetY);
                this.ctx.strokeStyle = '#cbd5e1';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });

        this.nodes.forEach(node => {
            const x = centerX + node.x;
            const y = centerY + node.y;
            const radius = 30 + (node.importance || 0) * 10;

            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.getNodeColor(node.type);
            this.ctx.fill();
            this.ctx.strokeStyle = '#1e293b';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const label = node.label.length > 10 ? node.label.substring(0, 10) + '...' : node.label;
            this.ctx.fillText(label, x, y);
        });
    }

    getNodeColor(type) {
        const colors = {
            concept: '#3b82f6',
            entity: '#10b981',
            relation: '#f59e0b',
            method: '#ef4444',
            result: '#8b5cf6'
        };
        return colors[type] || '#64748b';
    }

    async exportGraph() {
        if (this.nodes.length === 0) {
            showToast('No graph to export', 'warning');
            return;
        }

        try {
            const data = await API.exportKnowledgeGraph('json');
            downloadFile(JSON.stringify(data), 'knowledge-graph.json', 'application/json');
            showToast('Graph exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting graph:', error);
            showToast('Failed to export graph', 'error');
        }
    }
}

const knowledgeGraphManager = new KnowledgeGraphManager();
