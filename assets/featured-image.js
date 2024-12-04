<script>
  function updateFeaturedImage(imageSrc, imageAlt) {
    // Vind de hoofdafbeelding
    const featuredImage = document.getElementById('featured-image');
    
    // Update de afbeelding en alt-tekst
    if (featuredImage) {
      featuredImage.src = imageSrc;
      featuredImage.alt = imageAlt;
    }
  }
</script>
