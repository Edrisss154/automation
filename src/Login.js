import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SimplifiedMilkyWayModel = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 80);

        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Add orbit controls for mouse interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.autoRotate = false;

        // Reduced star count for simplicity
        const starCount = 1000;
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        const positions = [];
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            positions.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Spiral arms with reduced complexity
        const armCount = 2;
        const arms = [];
        for (let j = 0; j < armCount; j++) {
            const armGeometry = new THREE.BufferGeometry();
            const armPositions = [];
            for (let i = 0; i < starCount / armCount; i++) {
                const radius = Math.random() * 40 + 30;
                const angle = i * 0.2 + j * Math.PI; // Simpler spacing
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const z = (Math.random() - 0.5) * 5; // Subtle vertical variation
                armPositions.push(x, y, z);
            }
            armGeometry.setAttribute('position', new THREE.Float32BufferAttribute(armPositions, 3));

            const armMaterial = new THREE.PointsMaterial({
                color: `hsl(${j * 120}, 100%, 60%)`,
                size: 0.5,
                transparent: true,
                blending: THREE.AdditiveBlending,
            });

            const arm = new THREE.Points(armGeometry, armMaterial);
            scene.add(arm);
            arms.push(arm);
        }

        // Central core
        const coreGeometry = new THREE.SphereGeometry(6, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.8 });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(core);

        // Animation loop
        const animate = () => {
            arms.forEach((arm, index) => {
                arm.rotation.z += 0.001 * (index + 1);
            });
            stars.rotation.y += 0.0005;
            core.rotation.x += 0.001;
            controls.update(); // Update controls for smooth interaction
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
};

export default SimplifiedMilkyWayModel;


