import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';

const MilkyWaySolarSystem = () => {
    const mountRef = useRef(null);

    // Use refs to store scene objects
    const sceneObjects = useRef({
        stars: null,
        arms: [],
        planetMeshes: [],
        orbitPaths: [],
    });

    // Define viewModes using refs
    const viewModes = {
        solarSystem: () => {
            const { stars, arms, planetMeshes, orbitPaths } = sceneObjects.current;
            if (stars) stars.visible = false;
            arms.forEach(arm => (arm.visible = false));
            planetMeshes.forEach(planet => {
                planet.mesh.visible = true;
                if (planet.label) planet.label.visible = true;
            });
            orbitPaths.forEach(orbit => (orbit.visible = true));
        },
        galaxy: () => {
            const { stars, arms, planetMeshes, orbitPaths } = sceneObjects.current;
            if (stars) stars.visible = true;
            arms.forEach(arm => (arm.visible = true));
            planetMeshes.forEach(planet => {
                planet.mesh.visible = false;
                if (planet.label) planet.label.visible = false;
            });
            orbitPaths.forEach(orbit => (orbit.visible = false));
        },
        both: () => {
            const { stars, arms, planetMeshes, orbitPaths } = sceneObjects.current;
            if (stars) stars.visible = true;
            arms.forEach(arm => (arm.visible = true));
            planetMeshes.forEach(planet => {
                planet.mesh.visible = true;
                if (planet.label) planet.label.visible = true;
            });
            orbitPaths.forEach(orbit => (orbit.visible = true));
        },
    };

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 50, 150);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x111111, 1); // Dark mode background
        mountRef.current.appendChild(renderer.domElement);

        // Add orbit controls for mouse interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.autoRotate = false;
        controls.minDistance = 10; // Minimum zoom distance
        controls.maxDistance = 300; // Maximum zoom distance
        controls.maxPolarAngle = Math.PI; // Limit vertical rotation
        // Restrict camera from leaving galaxy bounds
        controls.addEventListener('change', () => {
            const maxBound = 300; // Define bounds for galaxy
            if (camera.position.length() > maxBound) {
                camera.position.setLength(maxBound);
            }
        });

        // Lighting (Sun as the light source + ambient light for galaxy)
        const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        // Increased star count for larger galaxy
        const starCount = 2000;
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        const positions = [];
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            positions.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);
        sceneObjects.current.stars = stars;

        // Spiral arms with increased size
        const armCount = 2;
        const arms = [];
        for (let j = 0; j < armCount; j++) {
            const armGeometry = new THREE.BufferGeometry();
            const armPositions = [];
            for (let i = 0; i < starCount / armCount; i++) {
                const radius = Math.random() * 80 + 60;
                const angle = i * 0.2 + j * Math.PI;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const z = (Math.random() - 0.5) * 10;
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
        sceneObjects.current.arms = arms;

        // Central core (representing the galactic core, also acting as the Sun)
        const coreGeometry = new THREE.SphereGeometry(5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.8 });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(core);

        // Sun halo effect
        const haloGeometry = new THREE.SphereGeometry(6, 32, 32);
        const haloMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        scene.add(halo);

        // Planets data (relative sizes and distances scaled down for visualization)
        const planets = [
            { name: 'Mercury', size: 0.4, distance: 10, color: 0xcccccc, speed: 0.02 },
            { name: 'Venus', size: 0.8, distance: 15, color: 0xffcc66, speed: 0.015 },
            { name: 'Earth', size: 0.8, distance: 20, color: 0x66b3ff, speed: 0.01 },
            { name: 'Mars', size: 0.6, distance: 25, color: 0xff6666, speed: 0.008 },
            { name: 'Jupiter', size: 3, distance: 35, color: 0xffb399, speed: 0.005 },
            { name: 'Saturn', size: 2.5, distance: 45, color: 0xffeb99, speed: 0.003 },
            { name: 'Uranus', size: 2, distance: 55, color: 0x99e6e6, speed: 0.002 },
            { name: 'Neptune', size: 2, distance: 65, color: 0x00008b, speed: 0.001 },
        ];

        const planetMeshes = [];
        const orbitPaths = [];

        // Create planets, their orbits, moons, and rings
        planets.forEach((planet, index) => {
            // Planet
            const planetGeometry = new THREE.SphereGeometry(planet.size, 32, 32);
            const planetMaterial = new THREE.MeshPhongMaterial({ color: planet.color, emissive: planet.color, emissiveIntensity: 0.2 });
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            planetMesh.position.x = planet.distance;
            scene.add(planetMesh);

            // Invisible hitbox for easier clicking
            const hitboxGeometry = new THREE.SphereGeometry(planet.size * 3, 32, 32); // Increased hitbox to 3x the planet size
            const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false }); // Invisible
            const hitboxMesh = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
            planetMesh.add(hitboxMesh);

            planetMeshes.push({ mesh: planetMesh, hitbox: hitboxMesh, distance: planet.distance, speed: planet.speed, name: planet.name });

            // Orbit path
            const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);
            orbitPaths.push(orbit);

            // Add Moon for Earth
            if (planet.name === 'Earth') {
                const moonGeometry = new THREE.SphereGeometry(0.25, 32, 32);
                const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, emissive: 0xaaaaaa, emissiveIntensity: 0.2 });
                const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                moon.position.set(3, 0, 0);
                planetMesh.add(moon);
                planetMeshes[index].moon = moon;
            }

            // Add Moons for Jupiter
            if (planet.name === 'Jupiter') {
                const moons = [];
                for (let i = 0; i < 4; i++) { // 4 Galilean moons
                    const moonGeometry = new THREE.SphereGeometry(0.4, 32, 32);
                    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc, emissive: 0xcccccc, emissiveIntensity: 0.2 });
                    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                    moon.position.set(4 + i * 0.8, 0, 0);
                    planetMesh.add(moon);
                    moons.push(moon);
                }
                planetMeshes[index].moons = moons;
            }

            // Add Ring for Saturn
            if (planet.name === 'Saturn') {
                const ringGeometry = new THREE.RingGeometry(3, 4.5, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xeedd82, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                planetMesh.add(ring);
            }

            // Add Label for Planets
            const spriteMaterial = new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(generateLabelTexture(planet.name)),
                transparent: true,
            });
            const label = new THREE.Sprite(spriteMaterial);
            label.scale.set(5, 2, 1);
            label.position.set(planet.distance, planet.size + 3, 0);
            scene.add(label);
            planetMeshes[index].label = label;
        });

        sceneObjects.current.planetMeshes = planetMeshes;
        sceneObjects.current.orbitPaths = orbitPaths;

        // Function to generate label texture
        function generateLabelTexture(text) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = '40px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            return canvas;
        }

        // Meteor setup with trail
        const meteors = [];
        const createMeteor = () => {
            const meteorGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const meteorMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.8 });
            const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);

            // Trail
            const trailGeometry = new THREE.ConeGeometry(0.1, 2, 16);
            const trailMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.5 });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.rotation.x = Math.PI / 2;
            trail.position.z = -1;
            meteor.add(trail);

            const startX = (Math.random() - 0.5) * 400;
            const startY = (Math.random() - 0.5) * 400;
            const startZ = 200;
            meteor.position.set(startX, startY, startZ);

            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 400,
                -200
            ).normalize();

            meteors.push({ mesh: meteor, direction, speed: 1 + Math.random() * 0.5 });
            scene.add(meteor);
        };

        // Meteor spawning logic
        let meteorSpawnTimer = 0;
        const spawnMeteor = (delta) => {
            meteorSpawnTimer += delta;
            if (meteorSpawnTimer > 3) {
                createMeteor();
                meteorSpawnTimer = 0;
            }

            meteors.forEach((meteor, index) => {
                meteor.mesh.position.add(meteor.direction.clone().multiplyScalar(meteor.speed));
                meteor.mesh.material.opacity -= 0.01;
                if (meteor.mesh.position.z < -200 || meteor.mesh.material.opacity <= 0) {
                    scene.remove(meteor.mesh);
                    meteors.splice(index, 1);
                }
            });
        };

        // Click and zoom functionality
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Single click to show planet info
        const onClick = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Debug: Log mouse coordinates
            console.log('Mouse coordinates:', mouse.x, mouse.y);

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planetMeshes.map(p => p.hitbox), true); // Use hitbox for intersection

            // Debug: Log intersections
            console.log('Intersections:', intersects);

            if (intersects.length > 0) {
                const planet = planetMeshes.find(p => p.hitbox === intersects[0].object);
                if (planet) {
                    alert(`سیاره: ${planet.name}\nفاصله از خورشید: ${planet.distance} واحد`);
                } else {
                    console.log('Planet not found for hitbox:', intersects[0].object);
                }
            } else {
                console.log('No intersection found');
            }
        };

        // Double click to zoom
        const onDoubleClick = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Debug: Log mouse coordinates
            console.log('Double-click Mouse coordinates:', mouse.x, mouse.y);

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planetMeshes.map(p => p.hitbox), true); // Use hitbox for intersection

            // Debug: Log intersections
            console.log('Double-click Intersections:', intersects);

            if (intersects.length > 0) {
                const planet = planetMeshes.find(p => p.hitbox === intersects[0].object);
                if (planet) {
                    const targetPosition = planet.mesh.position.clone().add(new THREE.Vector3(0, 5, 10));
                    new TWEEN.Tween(camera.position)
                        .to(targetPosition, 1000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                    controls.target = planet.mesh.position;
                } else {
                    console.log('Planet not found for hitbox:', intersects[0].object);
                }
            } else {
                console.log('No intersection found on double-click');
            }
        };

        window.addEventListener('click', onClick);
        window.addEventListener('dblclick', onDoubleClick);

        // Animation loop
        let time = 0;
        let lastTime = performance.now();
        const animate = () => {
            const currentTime = performance.now();
            const delta = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            time += 0.01;

            // Animate planets in their orbits
            planetMeshes.forEach((planet, index) => {
                const angle = time * planet.speed;
                planet.mesh.position.x = Math.cos(angle) * planet.distance;
                planet.mesh.position.z = Math.sin(angle) * planet.distance;
                planet.mesh.rotation.y += 0.01;

                // Update hitbox position to match the planet's position
                planet.hitbox.position.set(0, 0, 0); // Reset relative position
                planet.hitbox.position.copy(planet.mesh.position); // Match the planet's world position

                // Animate Moon for Earth
                if (planet.name === 'Earth' && planet.moon) {
                    const moonAngle = time * 0.05;
                    planet.moon.position.x = Math.cos(moonAngle) * 3;
                    planet.moon.position.z = Math.sin(moonAngle) * 3;
                }

                // Animate Moons for Jupiter
                if (planet.name === 'Jupiter' && planet.moons) {
                    planet.moons.forEach((moon, i) => {
                        const moonAngle = time * (0.03 + i * 0.01);
                        moon.position.x = Math.cos(moonAngle) * (4 + i * 0.8);
                        moon.position.z = Math.sin(moonAngle) * (4 + i * 0.8);
                    });
                }

                // Update label position
                if (planet.label) {
                    planet.label.position.set(planet.mesh.position.x, planet.mesh.position.y + planet.mesh.geometry.parameters.radius + 3, planet.mesh.position.z);
                    planet.label.lookAt(camera.position);
                }
            });

            // Animate galaxy elements
            arms.forEach((arm, index) => {
                arm.rotation.z += 0.001 * (index + 1);
            });
            stars.rotation.y += 0.0005;
            core.rotation.x += 0.001;

            // Animate halo
            halo.scale.set(1 + Math.sin(time) * 0.1, 1 + Math.sin(time) * 0.1, 1 + Math.sin(time) * 0.1);

            // Spawn and update meteors
            spawnMeteor(delta);

            controls.update();
            TWEEN.update();
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
            window.removeEventListener('click', onClick);
            window.removeEventListener('dblclick', onDoubleClick);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div className="relative w-screen h-screen" style={{ direction: 'rtl' }}>
            <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
            <div className="absolute top-20 right-5 flex flex-col gap-4 z-10">
                <button
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600"
                    style={{ backgroundColor: '#1f2937', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => viewModes.solarSystem()}
                >
                    منظومه شمسی
                </button>
                <button
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600"
                    style={{ backgroundColor: '#1f2937', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => viewModes.galaxy()}
                >
                    کهکشان
                </button>
                <button
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600"
                    style={{ backgroundColor: '#1f2937', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => viewModes.both()}
                >
                    هر دو
                </button>
                <p className="text-white mt-2">برای زوم روی سیارات دوبار کلیک کنید!</p>
                <p className="text-white mt-2">برای اطلاعات سیاره یک‌بار کلیک کنید!</p>
            </div>
        </div>
    );
};

export default MilkyWaySolarSystem;