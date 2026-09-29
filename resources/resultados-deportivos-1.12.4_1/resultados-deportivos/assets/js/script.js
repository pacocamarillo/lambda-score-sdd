document.addEventListener( 'DOMContentLoaded', function () {
	document.querySelectorAll( '.rd-wrapper' ).forEach( function ( wrapper ) {

		// Pestañas de nivel superior: Resultados / Acumulados.
		var tabButtons = wrapper.querySelectorAll( '.rd-tab-btn' );
		tabButtons.forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var targetId = btn.getAttribute( 'data-rd-tab-target' );
				var targetPanel = wrapper.querySelector( '#' + targetId );

				tabButtons.forEach( function ( b ) {
					b.classList.remove( 'is-active' );
				} );
				wrapper.querySelectorAll( '.rd-tab-panel' ).forEach( function ( panel ) {
					panel.classList.remove( 'is-active' );
					panel.style.display = 'none';
				} );

				btn.classList.add( 'is-active' );
				if ( targetPanel ) {
					targetPanel.classList.add( 'is-active' );
					targetPanel.style.display = 'block';
				}
			} );
		} );

		// Selector de años dentro de cada pestaña (aislado por pestaña para
		// que cambiar de año en "Resultados" no afecte a "Acumulados").
		wrapper.querySelectorAll( '.rd-layout' ).forEach( function ( layout ) {
			var buttons = layout.querySelectorAll( '.rd-year-btn' );

			buttons.forEach( function ( btn ) {
				btn.addEventListener( 'click', function () {
					var targetId = btn.getAttribute( 'data-rd-target' );
					var targetList = layout.querySelector( '#' + targetId );

					// Desactivar todos los botones y ocultar todas las listas de esta pestaña.
					buttons.forEach( function ( b ) {
						b.classList.remove( 'is-active' );
					} );
					layout.querySelectorAll( '.rd-list' ).forEach( function ( list ) {
						list.style.display = 'none';
					} );

					// Activar el seleccionado.
					btn.classList.add( 'is-active' );
					if ( targetList ) {
						targetList.style.display = 'block';
					}
				} );
			} );
		} );

		// Modal con iframe embebido.
		var modal = wrapper.querySelector( '.rd-modal' );
		if ( ! modal ) {
			return;
		}
		var modalBody  = modal.querySelector( '.rd-modal-body' );
		var modalInfo  = modal.querySelector( '.rd-modal-info' );
		var modalTitle = modal.querySelector( '.rd-modal-title' );

		function openModal( html, title, info ) {
			modalBody.innerHTML = html;
			modalTitle.textContent = title || '';

			if ( modalInfo ) {
				modalInfo.innerHTML = '';
				if ( info && ( info.fecha || info.lugar || info.descripcion ) ) {
					if ( info.fecha || info.lugar ) {
						var meta = document.createElement( 'p' );
						meta.className = 'rd-modal-meta';
						meta.textContent = [ info.fecha, info.lugar ].filter( Boolean ).join( ' · ' );
						modalInfo.appendChild( meta );
					}
					if ( info.descripcion ) {
						var desc = document.createElement( 'p' );
						desc.className = 'rd-modal-descripcion';
						desc.textContent = info.descripcion;
						modalInfo.appendChild( desc );
					}
				}
			}

			modal.classList.add( 'is-open' );
			modal.setAttribute( 'aria-hidden', 'false' );
			document.body.classList.add( 'rd-modal-open' );
		}

		function closeModal() {
			modal.classList.remove( 'is-open' );
			modal.setAttribute( 'aria-hidden', 'true' );
			document.body.classList.remove( 'rd-modal-open' );
			// Vaciar el contenido para detener cualquier carga/reproducción del iframe.
			modalBody.innerHTML = '';
			modalTitle.textContent = '';
			if ( modalInfo ) {
				modalInfo.innerHTML = '';
			}
		}

		// Botones que abren el modal: puede ser una tabla propia armada con
		// datos de la API de Webscorer (data-rd-ws-target, apunta a un
		// <template> ya renderizado en la página) o un iframe pegado a mano
		// (data-rd-iframe). El primero tiene prioridad si ambos existieran.
		wrapper.querySelectorAll( '.rd-item-modal-btn' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var title = btn.getAttribute( 'data-rd-title' );
				var info = {
					fecha: btn.getAttribute( 'data-rd-fecha' ) || '',
					lugar: btn.getAttribute( 'data-rd-lugar' ) || '',
					descripcion: btn.getAttribute( 'data-rd-descripcion' ) || '',
				};

				var wsTargetId = btn.getAttribute( 'data-rd-ws-target' );
				if ( wsTargetId ) {
					var tpl = wrapper.querySelector( '#' + wsTargetId );
					var wsHtml = tpl ? tpl.innerHTML : '';
					openModal( wsHtml || '<p>No se pudo cargar la tabla de resultados.</p>', title, info );
					return;
				}

				var iframeHtml = btn.getAttribute( 'data-rd-iframe' );
				if ( iframeHtml ) {
					openModal( iframeHtml, title, info );
				}
			} );
		} );

		modal.querySelectorAll( '[data-rd-close]' ).forEach( function ( el ) {
			el.addEventListener( 'click', closeModal );
		} );

		// "Expandir todas" / "Contraer todas" y los filtros "Ganadores" /
		// "Top 3" / "Resultados completos" de las tablas de Webscorer. Se
		// delega en modalBody porque ese contenido se inserta dinámicamente
		// cada vez que se abre el modal.
		modalBody.addEventListener( 'click', function ( e ) {
			var btnExpandir = e.target.closest( '.rd-ws-toggle-all' );
			if ( btnExpandir ) {
				var abrir = 'expand' === btnExpandir.getAttribute( 'data-rd-ws-action' );
				modalBody.querySelectorAll( '.rd-ws-group' ).forEach( function ( detalle ) {
					detalle.open = abrir;
				} );
				return;
			}

			var btnFiltro = e.target.closest( '.rd-ws-filter-btn' );
			if ( btnFiltro ) {
				var filtro = btnFiltro.getAttribute( 'data-rd-ws-filter' );
				var grupoBotones = btnFiltro.closest( '.rd-ws-toolbar-group' );
				if ( grupoBotones ) {
					grupoBotones.querySelectorAll( '.rd-ws-filter-btn' ).forEach( function ( b ) {
						b.classList.remove( 'is-active' );
					} );
				}
				btnFiltro.classList.add( 'is-active' );

				modalBody.querySelectorAll( 'tr[data-rd-place]' ).forEach( function ( fila ) {
					var lugar = parseInt( fila.getAttribute( 'data-rd-place' ), 10 );
					var visible = true;
					if ( 'winners' === filtro ) {
						visible = ( 1 === lugar );
					} else if ( 'top3' === filtro ) {
						visible = ( ! isNaN( lugar ) && lugar >= 1 && lugar <= 3 );
					}
					fila.style.display = visible ? '' : 'none';
				} );
			}
		} );

		document.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key && modal.classList.contains( 'is-open' ) ) {
				closeModal();
			}
		} );
	} );
} );
